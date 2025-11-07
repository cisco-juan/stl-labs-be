import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentQueryDto,
  TreatmentResponseDto,
  PaginatedTreatmentResponseDto,
  ChangeTreatmentStatusDto,
  UpdateTreatmentPaymentDto,
  TreatmentStatisticsQueryDto,
  TreatmentStatisticsResponseDto,
  StatisticsPeriod,
} from './dto';
import { Prisma, TreatmentStatus } from '@prisma/client';

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new treatment
   */
  async create(
    createDto: CreateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validate doctor exists if provided
    if (createDto.doctorId) {
      const doctor = await this.prisma.user.findUnique({
        where: { id: createDto.doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Médico no encontrado');
      }
    }

    // Validate branch exists if provided
    if (createDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: createDto.branchId },
      });

      if (!branch) {
        throw new NotFoundException('Sucursal no encontrada');
      }
    }

    // Validate dates
    if (createDto.startDate && createDto.endDate) {
      const start = new Date(createDto.startDate);
      const end = new Date(createDto.endDate);

      if (start >= end) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }
    }

    const treatment = await this.prisma.treatment.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        code: createDto.code,
        patientId: createDto.patientId,
        doctorId: createDto.doctorId,
        branchId: createDto.branchId,
        diagnosis: createDto.diagnosis,
        prognosis: createDto.prognosis,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        validityDate: createDto.validityDate
          ? new Date(createDto.validityDate)
          : null,
        notes: createDto.notes,
        status: createDto.status || TreatmentStatus.PENDING,
        price: createDto.price ?? 0,
        discount: createDto.discount ?? 0,
        discountPercentage: createDto.discountPercentage ?? 0,
      },
      include: this.getTreatmentInclude(),
    });

    return this.mapToResponse(treatment);
  }

  /**
   * Find all treatments with pagination and filters
   */
  async findAll(
    query: TreatmentQueryDto,
  ): Promise<PaginatedTreatmentResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      patientId,
      doctorId,
      branchId,
      status,
      isPaid,
      startDateFrom,
      startDateTo,
    } = query;
    const skip = (+(page || 1) - 1) * +(limit || 10);

    const where: Prisma.TreatmentWhereInput = {
      status: { not: TreatmentStatus.DELETED },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { diagnosis: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (isPaid !== undefined) {
      where.isPaid = isPaid;
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    const [treatments, total] = await Promise.all([
      this.prisma.treatment.findMany({
        where,
        skip,
        take: +(limit || 10),
        include: this.getTreatmentInclude(),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.treatment.count({ where }),
    ]);

    return {
      data: treatments.map((treatment) => this.mapToResponse(treatment)),
      meta: {
        total,
        page: +(page || 1),
        limit: +(limit || 10),
        totalPages: Math.ceil(total / +(limit || 10)) || 1
      },
    };
  }

  /**
   * Find a single treatment by ID
   */
  async findOne(id: string): Promise<TreatmentResponseDto> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: this.getTreatmentInclude(),
    });

    if (!treatment || treatment.status === TreatmentStatus.DELETED) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    return this.mapToResponse(treatment);
  }

  /**
   * Update a treatment
   */
  async update(
    id: string,
    updateDto: UpdateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    // Check if treatment exists
    const existing = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!existing || existing.status === TreatmentStatus.DELETED) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    // Validate patient exists if being updated
    if (updateDto.patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: updateDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado');
      }
    }

    // Validate doctor exists if being updated
    if (updateDto.doctorId) {
      const doctor = await this.prisma.user.findUnique({
        where: { id: updateDto.doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Médico no encontrado');
      }
    }

    // Validate branch exists if being updated
    if (updateDto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: updateDto.branchId },
      });

      if (!branch) {
        throw new NotFoundException('Sucursal no encontrada');
      }
    }

    // Validate dates
    const startDate = updateDto.startDate
      ? new Date(updateDto.startDate)
      : existing.startDate;
    const endDate = updateDto.endDate
      ? new Date(updateDto.endDate)
      : existing.endDate;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    const treatment = await this.prisma.treatment.update({
      where: { id },
      data: {
        ...updateDto,
        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        validityDate: updateDto.validityDate
          ? new Date(updateDto.validityDate)
          : undefined,
      },
      include: this.getTreatmentInclude(),
    });

    return this.mapToResponse(treatment);
  }

  /**
   * Delete a treatment (soft delete)
   */
  async remove(id: string): Promise<void> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            TreatmentStep: true,
            PaymentPlan: true,
            treatment_invoices: true,
          },
        },
      },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    // Check if it has active steps
    const activeSteps = await this.prisma.treatmentStep.count({
      where: {
        treatmentId: id,
        status: { notIn: ['COMPLETED', 'CANCELED', 'DELETED'] },
      },
    });

    if (activeSteps > 0) {
      throw new BadRequestException(
        'No se puede eliminar el tratamiento porque tiene pasos activos',
      );
    }

    await this.prisma.treatment.update({
      where: { id },
      data: { status: TreatmentStatus.DELETED },
    });
  }

  /**
   * Change treatment status
   */
  async changeStatus(
    id: string,
    changeStatusDto: ChangeTreatmentStatusDto,
  ): Promise<TreatmentResponseDto> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment || treatment.status === TreatmentStatus.DELETED) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: { status: changeStatusDto.status },
      include: this.getTreatmentInclude(),
    });

    return this.mapToResponse(updated);
  }

  /**
   * Update treatment payment status
   */
  async updatePaymentStatus(
    id: string,
    updatePaymentDto: UpdateTreatmentPaymentDto,
  ): Promise<TreatmentResponseDto> {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
    });

    if (!treatment || treatment.status === TreatmentStatus.DELETED) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    const updated = await this.prisma.treatment.update({
      where: { id },
      data: {
        isPaid: updatePaymentDto.isPaid,
        paymentMethod: updatePaymentDto.paymentMethod,
        paymentDate: updatePaymentDto.paymentDate
          ? new Date(updatePaymentDto.paymentDate)
          : updatePaymentDto.isPaid
            ? new Date()
            : null,
      },
      include: this.getTreatmentInclude(),
    });

    return this.mapToResponse(updated);
  }

  /**
   * Calculate total price from treatment steps
   */
  async calculateTotalPrice(treatmentId: string): Promise<number> {
    const steps = await this.prisma.treatmentStep.findMany({
      where: {
        treatmentId,
        status: { not: 'DELETED' },
      },
      select: {
        price: true,
        discount: true,
        discountPercentage: true,
        quantity: true,
      },
    });

    let total = 0;

    for (const step of steps) {
      let stepPrice = Number(step.price) * step.quantity;
      const discountAmount =
        Number(step.discount) +
        (stepPrice * Number(step.discountPercentage)) / 100;
      stepPrice -= discountAmount;
      total += stepPrice;
    }

    return total;
  }

  /**
   * Update treatment price and step counts
   * This should be called whenever steps are added/removed/completed
   */
  async updateTreatmentCounters(treatmentId: string): Promise<void> {
    const [steps, completedSteps] = await Promise.all([
      this.prisma.treatmentStep.count({
        where: {
          treatmentId,
          status: { not: 'DELETED' },
        },
      }),
      this.prisma.treatmentStep.count({
        where: {
          treatmentId,
          status: 'COMPLETED',
        },
      }),
    ]);

    const totalPrice = await this.calculateTotalPrice(treatmentId);

    await this.prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        totalSteps: steps,
        completedSteps: completedSteps,
        price: totalPrice,
      },
    });
  }

  /**
   * Get treatment statistics
   */
  async getStatistics(
    query: TreatmentStatisticsQueryDto,
  ): Promise<TreatmentStatisticsResponseDto> {
    const { period = StatisticsPeriod.ALL, startDate, endDate } = query;

    let dateFilter: Prisma.TreatmentWhereInput = {};

    if (period !== StatisticsPeriod.ALL || startDate || endDate) {
      const now = new Date();
      let periodStart: Date;

      if (startDate) {
        periodStart = new Date(startDate);
      } else {
        switch (period) {
          case StatisticsPeriod.DAY:
            periodStart = new Date(now.setHours(0, 0, 0, 0));
            break;
          case StatisticsPeriod.WEEK:
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - 7);
            break;
          case StatisticsPeriod.MONTH:
            periodStart = new Date(now);
            periodStart.setMonth(now.getMonth() - 1);
            break;
          case StatisticsPeriod.YEAR:
            periodStart = new Date(now);
            periodStart.setFullYear(now.getFullYear() - 1);
            break;
          default:
            periodStart = new Date(0);
        }
      }

      const periodEnd = endDate ? new Date(endDate) : new Date();

      dateFilter = {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      };
    }

    const where: Prisma.TreatmentWhereInput = {
      ...dateFilter,
      status: { not: TreatmentStatus.DELETED },
    };

    const [
      totalTreatments,
      paidTreatments,
      unpaidTreatments,
      completedTreatments,
      inProgressTreatments,
      canceledTreatments,
      treatmentsByStatus,
      treatmentsByDoctor,
      priceStats,
      stepStats,
    ] = await Promise.all([
      this.prisma.treatment.count({ where }),
      this.prisma.treatment.count({
        where: { ...where, isPaid: true },
      }),
      this.prisma.treatment.count({
        where: { ...where, isPaid: false },
      }),
      this.prisma.treatment.count({
        where: { ...where, status: TreatmentStatus.COMPLETED },
      }),
      this.prisma.treatment.count({
        where: {
          ...where,
          status: { in: [TreatmentStatus.PENDING, TreatmentStatus.CONFIRMED] },
        },
      }),
      this.prisma.treatment.count({
        where: { ...where, status: TreatmentStatus.CANCELED },
      }),
      this.prisma.treatment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.treatment.groupBy({
        by: ['doctorId'],
        where: { ...where, doctorId: { not: null } },
        _count: true,
      }),
      this.prisma.treatment.aggregate({
        where,
        _sum: { price: true },
        _avg: { price: true },
      }),
      this.prisma.treatment.aggregate({
        where,
        _avg: { totalSteps: true },
      }),
    ]);

    // Get doctor names
    const doctorIds = treatmentsByDoctor
      .map((t) => t.doctorId)
      .filter((id) => id !== null) as string[];

    const doctors = await this.prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, fullName: true },
    });

    const doctorMap = new Map(doctors.map((d) => [d.id, d.fullName]));

    const treatmentsByStatusDto = treatmentsByStatus.map((item) => ({
      status: item.status,
      count: item._count,
      percentage:
        totalTreatments > 0
          ? (item._count / totalTreatments) * 100
          : 0,
    }));

    const treatmentsByDoctorDto = treatmentsByDoctor
      .map((item) => ({
        doctorId: item.doctorId!,
        doctorName: doctorMap.get(item.doctorId!) || 'Sin asignar',
        count: item._count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTreatments,
      treatmentsByStatus: treatmentsByStatusDto,
      paidTreatments,
      unpaidTreatments,
      totalRevenue: priceStats._sum.price
        ? Number(priceStats._sum.price)
        : 0,
      averageRevenue: priceStats._avg.price ? Number(priceStats._avg.price) : 0,
      completedTreatments,
      inProgressTreatments,
      canceledTreatments,
      treatmentsByDoctor: treatmentsByDoctorDto,
      averageStepsPerTreatment: stepStats._avg.totalSteps
        ? Number(stepStats._avg.totalSteps)
        : 0,
    };
  }

  /**
   * Get treatment include object for Prisma queries
   */
  private getTreatmentInclude() {
    return {
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
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          TreatmentStep: true,
          treatment_appointments: true,
        },
      },
    };
  }

  /**
   * Map treatment to response DTO
   */
  private mapToResponse(treatment: any): TreatmentResponseDto {
    return {
      id: treatment.id,
      name: treatment.name,
      description: treatment.description,
      code: treatment.code,
      status: treatment.status,
      diagnosis: treatment.diagnosis,
      prognosis: treatment.prognosis,
      startDate: treatment.startDate,
      endDate: treatment.endDate,
      validityDate: treatment.validityDate,
      patient: treatment.patient
        ? {
            id: treatment.patient.id,
            fullName: treatment.patient.fullName,
          }
        : undefined,
      patientId: treatment.patientId,
      doctor: treatment.doctor
        ? {
            id: treatment.doctor.id,
            fullName: treatment.doctor.fullName,
          }
        : undefined,
      doctorId: treatment.doctorId,
      branch: treatment.branch
        ? {
            id: treatment.branch.id,
            name: treatment.branch.name,
          }
        : undefined,
      branchId: treatment.branchId,
      notes: treatment.notes,
      totalSteps: treatment.totalSteps,
      completedSteps: treatment.completedSteps,
      price: Number(treatment.price),
      isPaid: treatment.isPaid,
      paymentDate: treatment.paymentDate,
      paymentMethod: treatment.paymentMethod,
      discount: Number(treatment.discount),
      discountPercentage: Number(treatment.discountPercentage),
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
      stepCount: treatment._count?.TreatmentStep || 0,
      appointmentCount: treatment._count?.treatment_appointments || 0,
    };
  }
}

