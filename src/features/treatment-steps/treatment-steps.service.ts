import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TreatmentsService } from '../treatments/treatments.service';
import {
  CreateTreatmentStepDto,
  UpdateTreatmentStepDto,
  TreatmentStepQueryDto,
  TreatmentStepResponseDto,
  PaginatedTreatmentStepResponseDto,
  ChangeTreatmentStepStatusDto,
  ReorderTreatmentStepsDto,
} from './dto';
import { Prisma, TreatmentStepStatus } from '@prisma/client';

@Injectable()
export class TreatmentStepsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly treatmentsService: TreatmentsService,
  ) {}

  /**
   * Create a new treatment step
   */
  async create(
    createDto: CreateTreatmentStepDto,
  ): Promise<TreatmentStepResponseDto> {
    // Validate treatment exists
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: createDto.treatmentId },
    });

    if (!treatment || treatment.status === 'DELETED') {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    // Validate catalog treatment exists if provided
    if (createDto.catalogTreatmentId) {
      const catalogTreatment =
        await this.prisma.treatmentCatalog.findUnique({
          where: { id: createDto.catalogTreatmentId },
        });

      if (!catalogTreatment) {
        throw new NotFoundException(
          'Tratamiento del catálogo no encontrado',
        );
      }

      // Use catalog price if not provided
      if (!createDto.price && catalogTreatment.basePrice) {
        createDto.price = Number(catalogTreatment.basePrice);
      }
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

    // Get max order if order not provided
    let order = createDto.order;
    if (order === undefined) {
      const maxOrder = await this.prisma.treatmentStep.findFirst({
        where: { treatmentId: createDto.treatmentId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = maxOrder ? maxOrder.order + 1 : 0;
    }

    const step = await this.prisma.treatmentStep.create({
      data: {
        name: createDto.name,
        treatmentId: createDto.treatmentId,
        catalogTreatmentId: createDto.catalogTreatmentId,
        description: createDto.description,
        status: createDto.status || TreatmentStepStatus.PENDING,
        quantity: createDto.quantity ?? 1,
        price: createDto.price ?? 0,
        doctorId: createDto.doctorId,
        discount: createDto.discount ?? 0,
        discountPercentage: createDto.discountPercentage ?? 0,
        order: order,
        toothNumber: createDto.toothNumber,
        units: createDto.units || [],
        notes: createDto.notes,
      },
      include: this.getStepInclude(),
    });

    // Update treatment counters
    await this.treatmentsService.updateTreatmentCounters(
      createDto.treatmentId,
    );

    return this.mapToResponse(step);
  }

  /**
   * Find all treatment steps with pagination and filters
   */
  async findAll(
    query: TreatmentStepQueryDto,
  ): Promise<PaginatedTreatmentStepResponseDto> {
    const {
      page = 1,
      limit = 10,
      treatmentId,
      status,
      doctorId,
      isPaid,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TreatmentStepWhereInput = {
      treatmentId,
      status: { not: TreatmentStepStatus.DELETED },
    };

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (isPaid !== undefined) {
      where.isPaid = isPaid;
    }

    const [steps, total] = await Promise.all([
      this.prisma.treatmentStep.findMany({
        where,
        skip,
        take: limit,
        include: this.getStepInclude(),
        orderBy: { order: 'asc' },
      }),
      this.prisma.treatmentStep.count({ where }),
    ]);

    return {
      data: steps.map((step) => this.mapToResponse(step)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single treatment step by ID
   */
  async findOne(id: string): Promise<TreatmentStepResponseDto> {
    const step = await this.prisma.treatmentStep.findUnique({
      where: { id },
      include: this.getStepInclude(),
    });

    if (!step || step.status === TreatmentStepStatus.DELETED) {
      throw new NotFoundException('Paso de tratamiento no encontrado');
    }

    return this.mapToResponse(step);
  }

  /**
   * Update a treatment step
   */
  async update(
    id: string,
    updateDto: UpdateTreatmentStepDto,
  ): Promise<TreatmentStepResponseDto> {
    // Check if step exists
    const existing = await this.prisma.treatmentStep.findUnique({
      where: { id },
    });

    if (!existing || existing.status === TreatmentStepStatus.DELETED) {
      throw new NotFoundException('Paso de tratamiento no encontrado');
    }

    // Validate catalog treatment exists if being updated
    if (updateDto.catalogTreatmentId) {
      const catalogTreatment =
        await this.prisma.treatmentCatalog.findUnique({
          where: { id: updateDto.catalogTreatmentId },
        });

      if (!catalogTreatment) {
        throw new NotFoundException(
          'Tratamiento del catálogo no encontrado',
        );
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

    const step = await this.prisma.treatmentStep.update({
      where: { id },
      data: updateDto,
      include: this.getStepInclude(),
    });

    // Update treatment counters if price or status changed
    if (
      updateDto.price !== undefined ||
      updateDto.status !== undefined ||
      updateDto.discount !== undefined ||
      updateDto.discountPercentage !== undefined
    ) {
      await this.treatmentsService.updateTreatmentCounters(
        step.treatmentId!,
      );
    }

    return this.mapToResponse(step);
  }

  /**
   * Delete a treatment step
   */
  async remove(id: string): Promise<void> {
    const step = await this.prisma.treatmentStep.findUnique({
      where: { id },
    });

    if (!step) {
      throw new NotFoundException('Paso de tratamiento no encontrado');
    }

    await this.prisma.treatmentStep.update({
      where: { id },
      data: { status: TreatmentStepStatus.DELETED },
    });

    // Update treatment counters
    await this.treatmentsService.updateTreatmentCounters(step.treatmentId!);
  }

  /**
   * Change treatment step status
   */
  async changeStatus(
    id: string,
    changeStatusDto: ChangeTreatmentStepStatusDto,
  ): Promise<TreatmentStepResponseDto> {
    const step = await this.prisma.treatmentStep.findUnique({
      where: { id },
    });

    if (!step || step.status === TreatmentStepStatus.DELETED) {
      throw new NotFoundException('Paso de tratamiento no encontrado');
    }

    const updateData: any = {
      status: changeStatusDto.status,
    };

    // Set completedAt if status is COMPLETED
    if (changeStatusDto.status === TreatmentStepStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (step.status === TreatmentStepStatus.COMPLETED) {
      updateData.completedAt = null;
    }

    const updated = await this.prisma.treatmentStep.update({
      where: { id },
      data: updateData,
      include: this.getStepInclude(),
    });

    // Update treatment counters
    await this.treatmentsService.updateTreatmentCounters(step.treatmentId!);

    return this.mapToResponse(updated);
  }

  /**
   * Complete a treatment step
   */
  async complete(id: string): Promise<TreatmentStepResponseDto> {
    return this.changeStatus(id, {
      status: TreatmentStepStatus.COMPLETED,
    });
  }

  /**
   * Reorder treatment steps
   */
  async reorder(
    treatmentId: string,
    reorderDto: ReorderTreatmentStepsDto,
  ): Promise<void> {
    // Validate treatment exists
    await this.treatmentsService.findOne(treatmentId);

    // Validate all steps belong to the treatment
    const stepIds = reorderDto.steps.map((s) => s.stepId);
    const steps = await this.prisma.treatmentStep.findMany({
      where: {
        id: { in: stepIds },
        treatmentId,
      },
    });

    if (steps.length !== stepIds.length) {
      throw new BadRequestException(
        'Algunos pasos no pertenecen al tratamiento especificado',
      );
    }

    // Update orders in transaction
    await this.prisma.$transaction(
      reorderDto.steps.map((stepOrder) =>
        this.prisma.treatmentStep.update({
          where: { id: stepOrder.stepId },
          data: { order: stepOrder.order },
        }),
      ),
    );
  }

  /**
   * Get step include object for Prisma queries
   */
  private getStepInclude() {
    return {
      treatment: {
        select: {
          id: true,
          name: true,
        },
      },
      catalogTreatment: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      doctor: {
        select: {
          id: true,
          fullName: true,
        },
      },
    };
  }

  /**
   * Map step to response DTO
   */
  private mapToResponse(step: any): TreatmentStepResponseDto {
    return {
      id: step.id,
      name: step.name,
      status: step.status,
      description: step.description,
      treatment: step.treatment
        ? {
            id: step.treatment.id,
            name: step.treatment.name,
          }
        : undefined,
      treatmentId: step.treatmentId,
      catalogTreatment: step.catalogTreatment
        ? {
            id: step.catalogTreatment.id,
            code: step.catalogTreatment.code,
            name: step.catalogTreatment.name,
          }
        : undefined,
      catalogTreatmentId: step.catalogTreatmentId,
      notes: step.notes,
      quantity: step.quantity,
      price: Number(step.price),
      doctor: step.doctor
        ? {
            id: step.doctor.id,
            fullName: step.doctor.fullName,
          }
        : undefined,
      doctorId: step.doctorId,
      isPaid: step.isPaid,
      paymentDate: step.paymentDate,
      paymentMethod: step.paymentMethod,
      discount: Number(step.discount),
      discountPercentage: Number(step.discountPercentage),
      order: step.order,
      toothNumber: step.toothNumber,
      units: step.units,
      completedAt: step.completedAt,
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
    };
  }
}

