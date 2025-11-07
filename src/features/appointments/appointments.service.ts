import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AppointmentStatus } from '@prisma/client';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  AppointmentCalendarQueryDto,
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
  ChangeStatusDto,
  AppointmentTypeResponseDto,
  CalendarView,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new appointment
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const { patientId, doctorId, appointmentTypeId, dateTime, durationMinutes, ...rest } =
      createAppointmentDto;

    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validate doctor exists
    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }

    // Validate appointment type exists
    const appointmentType = await this.prisma.appointmentType.findUnique({
      where: { id: appointmentTypeId },
    });
    if (!appointmentType) {
      throw new NotFoundException('Tipo de cita no encontrado');
    }

    // Validate doctor availability
    await this.validateDoctorAvailability(
      doctorId,
      new Date(dateTime),
      durationMinutes,
    );

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentTypeId,
        dateTime: new Date(dateTime),
        durationMinutes,
        ...rest,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToAppointmentResponse(appointment);
  }

  /**
   * Finds all appointments with filters and pagination
   */
  async findAll(
    query: AppointmentQueryDto,
  ): Promise<PaginatedAppointmentResponseDto> {
    const {
      search,
      status,
      doctorId,
      patientId,
      branchId,
      dateFrom,
      dateTo,
      sortBy = 'dateTime',
      sortOrder = 'asc',
      page = '1',
      limit = '10',
    } = query;

    // Build where clause
    const where: Prisma.AppointmentWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        {
          patient: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          doctor: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          notes: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    // Other filters
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (branchId) where.branchId = branchId;

    // Date filters
    if (dateFrom || dateTo) {
      where.dateTime = {};
      if (dateFrom) where.dateTime.gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.dateTime.lte = endDate;
      }
    }

    // Count total
    const total = await this.prisma.appointment.count({ where });

    // Calculate pagination
    const skip = (+(page || 1) - 1) * +(limit || 10);
    const totalPages = Math.ceil(total / +(limit || 10));

    // Fetch appointments
    const appointments = await this.prisma.appointment.findMany({
      where,
      skip,
      take: +(limit || 10),
      orderBy: { [sortBy]: sortOrder },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: appointments.map((a) => this.mapToAppointmentResponse(a)),
      meta: {
        total,
        page: +(page || 1),
        limit: +(limit || 10),
        totalPages,
        hasNextPage: +(page || 1) < totalPages,
        hasPreviousPage: +(page || 1) > 1,
      },
    };
  }

  /**
   * Finds appointments for calendar view (today, week, month)
   */
  async findForCalendar(query: AppointmentCalendarQueryDto) {
    const { view, date, status, doctorId, patientId, branchId, search } = query;

    // Determine date range based on view
    const referenceDate = date ? new Date(date) : new Date();
    const { startDate, endDate } = this.getDateRangeForView(view, referenceDate);

    // Build where clause
    const where: Prisma.AppointmentWhereInput = {
      dateTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (branchId) where.branchId = branchId;

    if (search) {
      where.OR = [
        {
          patient: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          doctor: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Fetch appointments
    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: appointments.map((a) => this.mapToAppointmentResponse(a)),
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Finds pending appointments
   */
  async findPending(page = 1, limit = 10) {
    const where: Prisma.AppointmentWhereInput = {
      status: AppointmentStatus.PENDING,
    };

    const total = await this.prisma.appointment.count({ where });
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const appointments = await this.prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dateTime: 'asc' },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: appointments.map((a) => this.mapToAppointmentResponse(a)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Finds one appointment by ID
   */
  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return this.mapToAppointmentResponse(appointment);
  }

  /**
   * Updates an appointment
   */
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    // Check if appointment exists
    await this.findOne(id);

    const { dateTime, durationMinutes, doctorId, ...rest } = updateAppointmentDto;

    // If doctor or time changed, validate availability
    if (doctorId || dateTime || durationMinutes) {
      const currentAppointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!currentAppointment) {
        throw new NotFoundException('Cita no encontrada');
      }

      const newDoctorId = doctorId || currentAppointment.doctorId;
      const newDateTime = dateTime ? new Date(dateTime) : currentAppointment.dateTime;
      const newDuration = durationMinutes || currentAppointment.durationMinutes;

      if (!newDoctorId) {
        throw new BadRequestException('El ID del médico es requerido');
      }

      await this.validateDoctorAvailability(
        newDoctorId,
        newDateTime,
        newDuration,
        id, // Exclude current appointment from conflict check
      );
    }

    // Update appointment
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(durationMinutes && { durationMinutes }),
        ...(doctorId && { doctorId }),
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToAppointmentResponse(appointment);
  }

  /**
   * Changes appointment status
   */
  async updateStatus(
    id: string,
    changeStatusDto: ChangeStatusDto,
  ): Promise<AppointmentResponseDto> {
    // Check if appointment exists
    await this.findOne(id);

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: changeStatusDto.status,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToAppointmentResponse(appointment);
  }

  /**
   * Deletes an appointment
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.appointment.delete({
      where: { id },
    });

    return { message: 'Cita eliminada exitosamente' };
  }

  /**
   * Gets appointments for a patient
   */
  async findByPatient(patientId: string, page = 1, limit = 10) {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const where: Prisma.AppointmentWhereInput = {
      patientId,
    };

    const total = await this.prisma.appointment.count({ where });
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const appointments = await this.prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dateTime: 'desc' },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: appointments.map((a) => ({
        ...this.mapToAppointmentResponse(a),
        patientId,
        patientName: patient.fullName,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Gets appointments for a doctor
   */
  async findByDoctor(doctorId: string, page = 1, limit = 10) {
    // Validate doctor exists
    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }

    const where: Prisma.AppointmentWhereInput = {
      doctorId,
    };

    const total = await this.prisma.appointment.count({ where });
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const appointments = await this.prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dateTime: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: appointments.map((a) => ({
        ...this.mapToAppointmentResponse(a),
        doctorId,
        doctorName: doctor.fullName,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Gets all appointment types
   */
  async findAllAppointmentTypes(): Promise<AppointmentTypeResponseDto[]> {
    const types = await this.prisma.appointmentType.findMany({
      orderBy: { name: 'asc' },
    });

    return types.map((type) => ({
      id: type.id,
      name: type.name,
      description: type.description,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
    }));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validates that doctor doesn't have conflicting appointments
   */
  private async validateDoctorAvailability(
    doctorId: string,
    dateTime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const startTime = dateTime;
    const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);

    // Find overlapping appointments
    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: {
          notIn: [AppointmentStatus.CANCELED, AppointmentStatus.EXPIRED],
        },
        OR: [
          // Case 1: New appointment starts during existing appointment
          {
            AND: [
              { dateTime: { lte: startTime } },
              {
                dateTime: {
                  gte: new Date(
                    startTime.getTime() -
                      (await this.getMaxDurationMinutes()) * 60000,
                  ),
                },
              },
            ],
          },
          // Case 2: New appointment ends during existing appointment
          {
            AND: [
              { dateTime: { gte: startTime } },
              { dateTime: { lt: endTime } },
            ],
          },
        ],
      },
      select: {
        id: true,
        dateTime: true,
        durationMinutes: true,
      },
    });

    // Check for actual overlaps considering duration
    for (const existing of conflictingAppointments) {
      const existingStart = existing.dateTime;
      const existingEnd = new Date(
        existingStart.getTime() + existing.durationMinutes * 60000,
      );

      const hasOverlap =
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd);

      if (hasOverlap) {
        throw new ConflictException(
          `El médico ya tiene una cita programada en ese horario (${existingStart.toLocaleString()} - ${existingEnd.toLocaleString()})`,
        );
      }
    }
  }

  /**
   * Gets maximum duration from appointments (for overlap calculation)
   */
  private async getMaxDurationMinutes(): Promise<number> {
    const result = await this.prisma.appointment.aggregate({
      _max: {
        durationMinutes: true,
      },
    });

    return result._max.durationMinutes || 240; // Default 4 hours
  }

  /**
   * Gets date range for calendar view
   */
  private getDateRangeForView(
    view: CalendarView,
    referenceDate: Date,
  ): { startDate: Date; endDate: Date } {
    const startDate = new Date(referenceDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(referenceDate);
    endDate.setHours(23, 59, 59, 999);

    switch (view) {
      case CalendarView.TODAY:
        // Already set
        break;

      case CalendarView.WEEK:
        // Get Monday of the week
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        startDate.setDate(startDate.getDate() + diff);

        // Get Sunday of the week
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case CalendarView.MONTH:
        // First day of month
        startDate.setDate(1);

        // Last day of month
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Maps appointment to response DTO
   */
  private mapToAppointmentResponse(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      dateTime: appointment.dateTime,
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      notes: appointment.notes,
      patientId: appointment.patientId,
      patientName: appointment.patient?.fullName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor?.fullName,
      appointmentTypeId: appointment.appointmentTypeId,
      appointmentTypeName: appointment.appointmentType?.name,
      branchId: appointment.branchId,
      branchName: appointment.branch?.name,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
