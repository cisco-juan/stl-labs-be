import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePaymentPlanDto,
  UpdatePaymentPlanDto,
  PaymentPlanQueryDto,
  PaymentPlanResponseDto,
  PaymentInstallmentResponseDto,
  PaymentSummaryResponseDto,
  PayInstallmentDto,
} from './dto';
import { Prisma, PaymentMethod, PaymentInstallment } from '@prisma/client';

@Injectable()
export class PaymentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new payment plan and generate installments
   */
  async create(
    createDto: CreatePaymentPlanDto,
  ): Promise<PaymentPlanResponseDto> {
    // Validate treatment exists
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: createDto.treatmentId },
    });

    if (!treatment || treatment.status === 'DELETED') {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    // Check if treatment already has a payment plan
    const existingPlan = await this.prisma.paymentPlan.findFirst({
      where: { treatmentId: createDto.treatmentId },
    });

    if (existingPlan) {
      throw new BadRequestException(
        'El tratamiento ya tiene un plan de pago asociado',
      );
    }

    // Validate that total amount matches treatment price
    const totalPlanAmount =
      (createDto.initialPayment || 0) +
      createDto.installmentAmount * createDto.numberOfInstallments;
    const treatmentPrice = Number(treatment.price);

    // Allow small difference due to rounding
    if (Math.abs(totalPlanAmount - treatmentPrice) > 0.01) {
      throw new BadRequestException(
        `El monto total del plan (${totalPlanAmount}) no coincide con el precio del tratamiento (${treatmentPrice})`,
      );
    }

    const startDate = createDto.startDate
      ? new Date(createDto.startDate)
      : new Date();

    // Create payment plan and installments in transaction
    const paymentPlan = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.paymentPlan.create({
        data: {
          treatmentId: createDto.treatmentId,
          numberOfInstallments: createDto.numberOfInstallments,
          installmentAmount: createDto.installmentAmount,
          initialPayment: createDto.initialPayment || 0,
        },
      });

      // Generate installments
      const installments: PaymentInstallment[] = [];
      for (let i = 1; i <= createDto.numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const installment = await tx.paymentInstallment.create({
          data: {
            paymentPlanId: plan.id,
            installmentNumber: i,
            amount: createDto.installmentAmount,
            dueDate: dueDate,
            isPaid: false,
          },
        });

        installments.push(installment);
      }

      return { plan, installments };
    });

    return this.mapToResponse(paymentPlan.plan, paymentPlan.installments);
  }

  /**
   * Find all payment plans with optional filter
   */
  async findAll(
    query: PaymentPlanQueryDto,
  ): Promise<PaymentPlanResponseDto[]> {
    const where: Prisma.PaymentPlanWhereInput = {};

    if (query.treatmentId) {
      where.treatmentId = query.treatmentId;
    }

    const plans = await this.prisma.paymentPlan.findMany({
      where,
      include: {
        treatment: {
          select: {
            id: true,
            name: true,
          },
        },
        PaymentInstallment: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) =>
      this.mapToResponse(plan, plan.PaymentInstallment),
    );
  }

  /**
   * Find a single payment plan by ID
   */
  async findOne(id: string): Promise<PaymentPlanResponseDto> {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        treatment: {
          select: {
            id: true,
            name: true,
          },
        },
        PaymentInstallment: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan de pago no encontrado');
    }

    return this.mapToResponse(plan, plan.PaymentInstallment);
  }

  /**
   * Update a payment plan
   */
  async update(
    id: string,
    updateDto: UpdatePaymentPlanDto,
  ): Promise<PaymentPlanResponseDto> {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        PaymentInstallment: {
          where: { isPaid: false },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan de pago no encontrado');
    }

    // Check if there are paid installments
    const paidInstallments = await this.prisma.paymentInstallment.count({
      where: {
        paymentPlanId: id,
        isPaid: true,
      },
    });

    if (paidInstallments > 0) {
      throw new BadRequestException(
        'No se puede modificar un plan de pago que ya tiene cuotas pagadas',
      );
    }

    // If updating installments, regenerate them
    if (
      updateDto.numberOfInstallments ||
      updateDto.installmentAmount ||
      updateDto.initialPayment
    ) {
      // Delete existing installments
      await this.prisma.paymentInstallment.deleteMany({
        where: { paymentPlanId: id },
      });

      // Update plan
      const updatedPlan = await this.prisma.paymentPlan.update({
        where: { id },
        data: {
          numberOfInstallments:
            updateDto.numberOfInstallments || plan.numberOfInstallments,
          installmentAmount:
            updateDto.installmentAmount || plan.installmentAmount,
          initialPayment: updateDto.initialPayment ?? plan.initialPayment,
        },
      });

      // Generate new installments
      const startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : new Date();

      const installments: PaymentInstallment[] = [];
      for (
        let i = 1;
        i <= updatedPlan.numberOfInstallments;
        i++
      ) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const installment = await this.prisma.paymentInstallment.create({
          data: {
            paymentPlanId: updatedPlan.id,
            installmentNumber: i,
            amount: updatedPlan.installmentAmount,
            dueDate: dueDate,
            isPaid: false,
          },
        });

        installments.push(installment);
      }

      const planWithTreatment = await this.prisma.paymentPlan.findUnique({
        where: { id },
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return this.mapToResponse(planWithTreatment!, installments);
    } else {
      // Just update the plan
      const updatedPlan = await this.prisma.paymentPlan.update({
        where: { id },
        data: updateDto,
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
            },
          },
          PaymentInstallment: {
            orderBy: { installmentNumber: 'asc' },
          },
        },
      });

      return this.mapToResponse(updatedPlan, updatedPlan.PaymentInstallment);
    }
  }

  /**
   * Delete a payment plan
   */
  async remove(id: string): Promise<void> {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        PaymentInstallment: {
          where: { isPaid: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan de pago no encontrado');
    }

    // Check if there are paid installments
    if (plan.PaymentInstallment.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un plan de pago que tiene cuotas pagadas',
      );
    }

    // Delete installments first
    await this.prisma.paymentInstallment.deleteMany({
      where: { paymentPlanId: id },
    });

    // Delete plan
    await this.prisma.paymentPlan.delete({
      where: { id },
    });
  }

  /**
   * Mark an installment as paid
   */
  async markInstallmentPaid(
    planId: string,
    installmentId: string,
    payDto: PayInstallmentDto,
  ): Promise<PaymentInstallmentResponseDto> {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan de pago no encontrado');
    }

    const installment = await this.prisma.paymentInstallment.findFirst({
      where: {
        id: installmentId,
        paymentPlanId: planId,
      },
    });

    if (!installment) {
      throw new NotFoundException('Cuota no encontrada');
    }

    if (installment.isPaid) {
      throw new BadRequestException('La cuota ya está pagada');
    }

    const updated = await this.prisma.paymentInstallment.update({
      where: { id: installmentId },
      data: {
        isPaid: true,
        paidDate: payDto.paymentDate
          ? new Date(payDto.paymentDate)
          : new Date(),
        paymentMethod: payDto.paymentMethod,
      },
    });

    return this.mapInstallmentToResponse(updated);
  }

  /**
   * Get payment summary for a plan
   */
  async getPaymentSummary(
    planId: string,
  ): Promise<PaymentSummaryResponseDto> {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
      include: {
        PaymentInstallment: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan de pago no encontrado');
    }

    const totalInstallments = plan.PaymentInstallment.length;
    const paidInstallments = plan.PaymentInstallment.filter(
      (i) => i.isPaid,
    ).length;
    const pendingInstallments = totalInstallments - paidInstallments;

    const totalAmount =
      Number(plan.initialPayment) +
      plan.PaymentInstallment.reduce(
        (sum, i) => sum + Number(i.amount),
        0,
      );
    const paidAmount =
      Number(plan.initialPayment) +
      plan.PaymentInstallment
        .filter((i) => i.isPaid)
        .reduce((sum, i) => sum + Number(i.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    const paidPercentage =
      totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return {
      totalInstallments,
      paidInstallments,
      pendingInstallments,
      totalAmount,
      paidAmount,
      pendingAmount,
      paidPercentage,
    };
  }

  /**
   * Map payment plan to response DTO
   */
  private mapToResponse(
    plan: any,
    installments: any[],
  ): PaymentPlanResponseDto {
    return {
      id: plan.id,
      treatment: plan.treatment
        ? {
            id: plan.treatment.id,
            name: plan.treatment.name,
          }
        : {
            id: plan.treatmentId,
            name: '',
          },
      treatmentId: plan.treatmentId,
      numberOfInstallments: plan.numberOfInstallments,
      installmentAmount: Number(plan.installmentAmount),
      initialPayment: Number(plan.initialPayment),
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      installments: installments.map((i) => this.mapInstallmentToResponse(i)),
    };
  }

  /**
   * Map installment to response DTO
   */
  private mapInstallmentToResponse(
    installment: any,
  ): PaymentInstallmentResponseDto {
    return {
      id: installment.id,
      installmentNumber: installment.installmentNumber,
      amount: Number(installment.amount),
      dueDate: installment.dueDate,
      paidDate: installment.paidDate,
      isPaid: installment.isPaid,
      paymentMethod: installment.paymentMethod,
      createdAt: installment.createdAt,
      updatedAt: installment.updatedAt,
    };
  }
}

