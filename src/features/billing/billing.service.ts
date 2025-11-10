import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, InvoiceStatus, PaymentStatus } from '@prisma/client';
import {
  InvoiceQueryDto,
  PaymentQueryDto,
  AccountsReceivableQueryDto,
  InvoiceResponseDto,
  PaymentResponseDto,
  AccountsReceivableResponseDto,
  PaginatedInvoiceResponseDto,
  PaginatedPaymentResponseDto,
  PaginatedAccountsReceivableResponseDto,
  ReceivablePriority,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ChangeInvoiceStatusDto,
  CreatePaymentDto,
} from './dto';
import { PdfGeneratorService } from './services/pdf-generator.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  // ==================== INVOICES ====================

  /**
   * Finds all invoices with filters and pagination
   */
  async findAllInvoices(
    query: InvoiceQueryDto,
  ): Promise<PaginatedInvoiceResponseDto> {
    const {
      search,
      status,
      patientId,
      branchId,
      createdFrom,
      createdTo,
      expiresFrom,
      expiresTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {
      status: status || { not: InvoiceStatus.DELETED },
    };

    // Search filter
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            fullName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Other filters
    if (patientId) where.patientId = patientId;
    if (branchId) where.branchId = branchId;

    // Date filters
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) {
        const endDate = new Date(createdTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (expiresFrom || expiresTo) {
      where.expiresAt = {};
      if (expiresFrom) where.expiresAt.gte = new Date(expiresFrom);
      if (expiresTo) {
        const endDate = new Date(expiresTo);
        endDate.setHours(23, 59, 59, 999);
        where.expiresAt.lte = endDate;
      }
    }

    // Count total
    const total = await this.prisma.invoice.count({ where });

    // Calculate pagination
    const pageNum = +(page || 1);
    const limitNum = +(limit || 10);
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(total / limitNum);

    // Fetch invoices
    const invoices = await this.prisma.invoice.findMany({
      where,
      skip,
      take: limitNum,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    return {
      data: invoices.map((invoice) => this.mapToInvoiceResponse(invoice)),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }

  /**
   * Gets invoice details
   */
  async getInvoiceDetails(invoiceId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
        Payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    return this.mapToInvoiceResponse(invoice);
  }

  /**
   * Creates a new invoice
   */
  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const {
      patientId,
      treatmentId,
      treatmentStepId,
      doctorId,
      branchId,
      items,
      discount = 0,
      expiresAt,
      currency = 'USD',
    } = createInvoiceDto;

    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validate treatment if provided
    if (treatmentId) {
      const treatment = await this.prisma.treatment.findUnique({
        where: { id: treatmentId },
      });
      if (!treatment) {
        throw new NotFoundException('Tratamiento no encontrado');
      }
    }

    // Validate treatment step if provided
    if (treatmentStepId) {
      const treatmentStep = await this.prisma.treatmentStep.findUnique({
        where: { id: treatmentStepId },
      });
      if (!treatmentStep) {
        throw new NotFoundException('Paso de tratamiento no encontrado');
      }
    }

    // Calculate total amount from items
    let subtotal = 0;
    for (const item of items) {
      const itemTotal = item.price * item.quantity - (item.discount || 0);
      subtotal += itemTotal;
    }

    const totalAmount = subtotal - discount;

    if (totalAmount < 0) {
      throw new BadRequestException(
        'El total de la factura no puede ser negativo',
      );
    }

    // Generate invoice code
    const code = await this.generateInvoiceCode();

    // Create invoice with items
    const invoice = await this.prisma.invoice.create({
      data: {
        code,
        patientId,
        treatmentId,
        treatmentStepId,
        doctorId,
        branchId,
        totalAmount,
        discount,
        currency,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status: InvoiceStatus.PENDING,
        InvoiceItem: {
          create: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount || 0,
            inventoryId: item.inventoryId,
          })),
        },
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
        Payment: true,
      },
    });

    return this.mapToInvoiceResponse(invoice);
  }

  /**
   * Updates an invoice
   */
  async updateInvoice(
    invoiceId: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Check if invoice can be updated
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException(
        'No se puede actualizar una factura pagada',
      );
    }

    const {
      patientId,
      treatmentId,
      treatmentStepId,
      doctorId,
      branchId,
      items,
      discount,
      expiresAt,
      currency,
    } = updateInvoiceDto;

    // Validate patient if provided
    if (patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        throw new NotFoundException('Paciente no encontrado');
      }
    }

    // Recalculate total if items are provided
    let totalAmount = Number(invoice.totalAmount);
    if (items) {
      let subtotal = 0;
      for (const item of items) {
        const itemTotal = item.price * item.quantity - (item.discount || 0);
        subtotal += itemTotal;
      }
      const invoiceDiscount = discount !== undefined ? discount : Number(invoice.discount);
      totalAmount = subtotal - invoiceDiscount;
    } else if (discount !== undefined) {
      // Recalculate with existing items
      const existingItems = await this.prisma.invoiceItem.findMany({
        where: {
          invoiceId,
          isDeleted: false,
        },
      });
      let subtotal = 0;
      for (const item of existingItems) {
        const itemTotal =
          Number(item.price) * item.quantity - Number(item.discount);
        subtotal += itemTotal;
      }
      totalAmount = subtotal - discount;
    }

    if (totalAmount < 0) {
      throw new BadRequestException(
        'El total de la factura no puede ser negativo',
      );
    }

    // Update invoice
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        patientId,
        treatmentId,
        treatmentStepId,
        doctorId,
        branchId,
        totalAmount,
        discount: discount ?? invoice.discount,
        currency: currency ?? invoice.currency,
        expiresAt: expiresAt ? new Date(expiresAt) : invoice.expiresAt,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
        Payment: true,
      },
    });

    // Update items if provided
    if (items) {
      // Mark existing items as deleted
      await this.prisma.invoiceItem.updateMany({
        where: { invoiceId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Create new items
      await this.prisma.invoiceItem.createMany({
        data: items.map((item) => ({
          invoiceId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          inventoryId: item.inventoryId,
        })),
      });

      // Reload invoice with updated items
      const reloadedInvoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
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
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          InvoiceItem: {
            where: {
              isDeleted: false,
            },
          },
          Payment: true,
        },
      });

      return this.mapToInvoiceResponse(reloadedInvoice!);
    }

    return this.mapToInvoiceResponse(updatedInvoice);
  }

  /**
   * Changes invoice status
   */
  async changeInvoiceStatus(
    invoiceId: string,
    changeStatusDto: ChangeInvoiceStatusDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    const { status } = changeStatusDto;

    // Validate status transition
    if (invoice.status === InvoiceStatus.PAID && status !== InvoiceStatus.PAID) {
      throw new BadRequestException(
        'No se puede cambiar el estado de una factura pagada',
      );
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        InvoiceItem: {
          where: {
            isDeleted: false,
          },
        },
        Payment: true,
      },
    });

    return this.mapToInvoiceResponse(updatedInvoice);
  }

  /**
   * Gets payments for an invoice
   */
  async getInvoicePayments(
    invoiceId: string,
  ): Promise<PaymentResponseDto[]> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    const payments = await this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    return payments.map((payment) => this.mapToPaymentResponse(payment));
  }

  /**
   * Creates a new payment
   */
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const { invoiceId, amount, paymentMethod, paymentDate, reference, notes } =
      createPaymentDto;

    // Validate invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        Payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Check if invoice is already paid or canceled
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('La factura ya está pagada completamente');
    }

    if (invoice.status === InvoiceStatus.CANCELED) {
      throw new BadRequestException('No se puede pagar una factura cancelada');
    }

    // Calculate current paid amount
    const currentPaidAmount = Number(invoice.paidAmount);
    const totalAmount = Number(invoice.totalAmount);
    const newPaidAmount = currentPaidAmount + amount;

    // Check if payment exceeds invoice total
    if (newPaidAmount > totalAmount) {
      throw new BadRequestException(
        `El pago excede el total de la factura. Total: $${totalAmount.toFixed(2)}, Pagado: $${currentPaidAmount.toFixed(2)}, Nuevo pago: $${amount.toFixed(2)}`,
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        reference,
        notes,
        status: PaymentStatus.PAID,
      },
      include: {
        invoice: {
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Update invoice paid amount and status
    const isFullyPaid = newPaidAmount >= totalAmount;
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        isPaid: isFullyPaid,
        status: isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
        paidAt: isFullyPaid ? new Date() : invoice.paidAt,
        paymentMethod: isFullyPaid ? paymentMethod : invoice.paymentMethod,
        currentPaymentAmount: amount,
      },
    });

    return this.mapToPaymentResponse(payment);
  }

  /**
   * Exports invoices to CSV in batches
   */
  async *exportInvoicesToCsv(
    query: InvoiceQueryDto,
  ): AsyncGenerator<string> {
    const { sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;

    // Build where clause (same as findAllInvoices)
    const where: Prisma.InvoiceWhereInput = {
      status: filters.status || { not: InvoiceStatus.DELETED },
    };

    if (filters.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        {
          patient: {
            fullName: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.branchId) where.branchId = filters.branchId;

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) where.createdAt.gte = new Date(filters.createdFrom);
      if (filters.createdTo) {
        const endDate = new Date(filters.createdTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (filters.expiresFrom || filters.expiresTo) {
      where.expiresAt = {};
      if (filters.expiresFrom) where.expiresAt.gte = new Date(filters.expiresFrom);
      if (filters.expiresTo) {
        const endDate = new Date(filters.expiresTo);
        endDate.setHours(23, 59, 59, 999);
        where.expiresAt.lte = endDate;
      }
    }

    // CSV Headers
    yield '\ufeff'; // BOM for Excel UTF-8
    yield 'Factura,Paciente,Fecha,Vencimiento,Total,Pagado,Saldo,Estado\n';

    // Process in batches of 20
    const batchSize = 20;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const invoices = await this.prisma.invoice.findMany({
        where,
        skip,
        take: batchSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: {
            select: {
              fullName: true,
            },
          },
        },
      });

      if (invoices.length === 0) {
        hasMore = false;
        break;
      }

      // Convert to CSV rows
      for (const invoice of invoices) {
        const total = Number(invoice.totalAmount);
        const paid = Number(invoice.paidAmount);
        const balance = total - paid;
        const expiresAt = invoice.expiresAt
          ? new Date(invoice.expiresAt).toISOString().split('T')[0]
          : '';
        const createdAt = invoice.createdAt
          ? new Date(invoice.createdAt).toISOString().split('T')[0]
          : '';

        const row = [
          this.escapeCsvValue(invoice.code || invoice.id.substring(0, 8).toUpperCase()),
          this.escapeCsvValue(invoice.patient?.fullName || 'N/A'),
          createdAt,
          expiresAt,
          total.toFixed(2),
          paid.toFixed(2),
          balance.toFixed(2),
          this.translateStatus(invoice.status),
        ].join(',');

        yield row + '\n';
      }

      skip += batchSize;
    }
  }

  /**
   * Generates PDF for an invoice
   */
  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    return this.pdfGenerator.generateInvoicePdf(invoiceId);
  }

  // ==================== PAYMENTS ====================

  /**
   * Finds all payments with filters and pagination
   */
  async findAllPayments(
    query: PaymentQueryDto,
  ): Promise<PaginatedPaymentResponseDto> {
    const {
      search,
      paymentMethod,
      status,
      patientId,
      invoiceId,
      paymentDateFrom,
      paymentDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    // Build where clause
    const where: Prisma.PaymentWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        {
          invoice: {
            code: { contains: search, mode: 'insensitive' },
          },
        },
        {
          invoice: {
            patient: {
              fullName: { contains: search, mode: 'insensitive' },
            },
          },
        },
        {
          reference: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    // Other filters
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;
    if (patientId) {
      where.invoice = {
        patientId,
      };
    }
    if (invoiceId) where.invoiceId = invoiceId;

    // Date filters
    if (paymentDateFrom || paymentDateTo) {
      where.paymentDate = {};
      if (paymentDateFrom) where.paymentDate.gte = new Date(paymentDateFrom);
      if (paymentDateTo) {
        const endDate = new Date(paymentDateTo);
        endDate.setHours(23, 59, 59, 999);
        where.paymentDate.lte = endDate;
      }
    }

    // Count total
    const total = await this.prisma.payment.count({ where });

    // Calculate pagination
    const pageNum = +(page || 1);
    const limitNum = +(limit || 10);
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(total / limitNum);

    // Fetch payments
    const payments = await this.prisma.payment.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
      include: {
        invoice: {
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    return {
      data: payments.map((payment) => this.mapToPaymentResponse(payment)),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }

  /**
   * Exports payments to CSV in batches
   */
  async *exportPaymentsToCsv(
    query: PaymentQueryDto,
  ): AsyncGenerator<string> {
    const { sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;

    // Build where clause (same as findAllPayments)
    const where: Prisma.PaymentWhereInput = {};

    if (filters.search) {
      where.OR = [
        {
          invoice: {
            code: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          invoice: {
            patient: {
              fullName: { contains: filters.search, mode: 'insensitive' },
            },
          },
        },
        {
          reference: { contains: filters.search, mode: 'insensitive' },
        },
      ];
    }

    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.status) where.status = filters.status;
    if (filters.patientId) {
      where.invoice = {
        patientId: filters.patientId,
      };
    }
    if (filters.invoiceId) where.invoiceId = filters.invoiceId;

    if (filters.paymentDateFrom || filters.paymentDateTo) {
      where.paymentDate = {};
      if (filters.paymentDateFrom) where.paymentDate.gte = new Date(filters.paymentDateFrom);
      if (filters.paymentDateTo) {
        const endDate = new Date(filters.paymentDateTo);
        endDate.setHours(23, 59, 59, 999);
        where.paymentDate.lte = endDate;
      }
    }

    // CSV Headers
    yield '\ufeff'; // BOM for Excel UTF-8
    yield 'Recibo,Fecha,Paciente,Factura,Método de Pago,Referencia,Monto,Estado\n';

    // Process in batches of 20
    const batchSize = 20;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const payments = await this.prisma.payment.findMany({
        where,
        skip,
        take: batchSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          invoice: {
            include: {
              patient: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (payments.length === 0) {
        hasMore = false;
        break;
      }

      // Convert to CSV rows
      for (const payment of payments) {
        const paymentDate = payment.paymentDate || payment.createdAt;
        const dateStr = new Date(paymentDate).toISOString().split('T')[0];

        const row = [
          this.escapeCsvValue(payment.id.substring(0, 8).toUpperCase()),
          dateStr,
          this.escapeCsvValue(payment.invoice?.patient?.fullName || 'N/A'),
          this.escapeCsvValue(payment.invoice?.code || 'N/A'),
          this.translatePaymentMethod(payment.paymentMethod),
          this.escapeCsvValue(payment.reference || '-'),
          Number(payment.amount).toFixed(2),
          this.translatePaymentStatus(payment.status),
        ].join(',');

        yield row + '\n';
      }

      skip += batchSize;
    }
  }

  /**
   * Generates PDF for a payment receipt
   */
  async generatePaymentReceiptPdf(paymentId: string): Promise<Buffer> {
    return this.pdfGenerator.generatePaymentReceiptPdf(paymentId);
  }

  // ==================== ACCOUNTS RECEIVABLE ====================

  /**
   * Finds all accounts receivable with filters and pagination
   */
  async findAllAccountsReceivable(
    query: AccountsReceivableQueryDto,
  ): Promise<PaginatedAccountsReceivableResponseDto> {
    const {
      search,
      daysOverdueMin,
      daysOverdueMax,
      priority,
      invoiceDateFrom,
      invoiceDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    // Get all invoices with pending balance
    const invoiceWhere: Prisma.InvoiceWhereInput = {
      status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.DELETED, InvoiceStatus.CANCELED] },
    };

    if (search) {
      invoiceWhere.patient = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    if (invoiceDateFrom || invoiceDateTo) {
      invoiceWhere.createdAt = {};
      if (invoiceDateFrom) invoiceWhere.createdAt.gte = new Date(invoiceDateFrom);
      if (invoiceDateTo) {
        const endDate = new Date(invoiceDateTo);
        endDate.setHours(23, 59, 59, 999);
        invoiceWhere.createdAt.lte = endDate;
      }
    }

    const invoices = await this.prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    // Group by patient and calculate totals
    const patientMap = new Map<string, AccountsReceivableResponseDto>();

    const now = new Date();

    for (const invoice of invoices) {
      if (!invoice.patientId || !invoice.patient) continue;

      const total = Number(invoice.totalAmount);
      const paid = Number(invoice.paidAmount);
      const balance = total - paid;

      if (balance <= 0) continue;

      const patientId = invoice.patientId;

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patientId,
          patientName: invoice.patient.fullName,
          phoneNumber: invoice.patient.phoneNumber || undefined,
          email: invoice.patient.email || undefined,
          invoices: [],
          daysOverdue: 0,
          totalDebt: 0,
          priority: ReceivablePriority.LOW,
        });
      }

      const receivable = patientMap.get(patientId)!;

      // Calculate days overdue
      const expiresAt = invoice.expiresAt ? new Date(invoice.expiresAt) : null;
      const daysOverdue = expiresAt
        ? Math.max(0, Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      receivable.invoices.push({
        code: invoice.code || invoice.id.substring(0, 8).toUpperCase(),
        date: invoice.createdAt,
        totalDebt: balance,
      });

      receivable.totalDebt += balance;
      receivable.daysOverdue = Math.max(receivable.daysOverdue, daysOverdue);
    }

    // Calculate priority and filter by days overdue
    let receivables = Array.from(patientMap.values());

    for (const receivable of receivables) {
      if (receivable.daysOverdue > 30) {
        receivable.priority = ReceivablePriority.HIGH;
      } else if (receivable.daysOverdue > 15) {
        receivable.priority = ReceivablePriority.MEDIUM;
      } else {
        receivable.priority = ReceivablePriority.LOW;
      }
    }

    // Apply filters
    if (daysOverdueMin !== undefined) {
      receivables = receivables.filter((r) => r.daysOverdue >= daysOverdueMin);
    }
    if (daysOverdueMax !== undefined) {
      receivables = receivables.filter((r) => r.daysOverdue <= daysOverdueMax);
    }
    if (priority) {
      receivables = receivables.filter((r) => r.priority === priority);
    }

    // Sort
    receivables.sort((a, b) => {
      const aValue = a[sortBy as keyof AccountsReceivableResponseDto];
      const bValue = b[sortBy as keyof AccountsReceivableResponseDto];
      if (aValue === undefined || bValue === undefined) return 0;
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Paginate
    const pageNum = +(page || 1);
    const limitNum = +(limit || 10);
    const skip = (pageNum - 1) * limitNum;
    const total = receivables.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginatedData = receivables.slice(skip, skip + limitNum);

    return {
      data: paginatedData,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }

  /**
   * Exports accounts receivable to CSV in batches
   */
  async *exportAccountsReceivableToCsv(
    query: AccountsReceivableQueryDto,
  ): AsyncGenerator<string> {
    const { sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;

    // Get all invoices with pending balance (same logic as findAllAccountsReceivable)
    const invoiceWhere: Prisma.InvoiceWhereInput = {
      status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.DELETED, InvoiceStatus.CANCELED] },
    };

    if (filters.search) {
      invoiceWhere.patient = {
        fullName: { contains: filters.search, mode: 'insensitive' },
      };
    }

    if (filters.invoiceDateFrom || filters.invoiceDateTo) {
      invoiceWhere.createdAt = {};
      if (filters.invoiceDateFrom) invoiceWhere.createdAt.gte = new Date(filters.invoiceDateFrom);
      if (filters.invoiceDateTo) {
        const endDate = new Date(filters.invoiceDateTo);
        endDate.setHours(23, 59, 59, 999);
        invoiceWhere.createdAt.lte = endDate;
      }
    }

    // CSV Headers
    yield '\ufeff'; // BOM for Excel UTF-8
    yield 'Paciente,Contacto,Facturas,Días Vencido,Total Deuda,Prioridad\n';

    // Process invoices in batches and accumulate by patient
    const batchSize = 20;
    let skip = 0;
    let hasMore = true;
    const patientMap = new Map<string, any>();
    const now = new Date();

    // First pass: accumulate all invoices grouped by patient
    while (hasMore) {
      const invoices = await this.prisma.invoice.findMany({
        where: invoiceWhere,
        skip,
        take: batchSize,
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      });

      if (invoices.length === 0) {
        hasMore = false;
        break;
      }

      // Accumulate in patient map
      for (const invoice of invoices) {
        if (!invoice.patientId || !invoice.patient) continue;

        const total = Number(invoice.totalAmount);
        const paid = Number(invoice.paidAmount);
        const balance = total - paid;

        if (balance <= 0) continue;

        const patientId = invoice.patientId;

        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            patientName: invoice.patient.fullName,
            contact: invoice.patient.phoneNumber || invoice.patient.email || 'N/A',
            invoiceCodes: [],
            daysOverdue: 0,
            totalDebt: 0,
          });
        }

        const receivable = patientMap.get(patientId);

        const expiresAt = invoice.expiresAt ? new Date(invoice.expiresAt) : null;
        const daysOverdue = expiresAt
          ? Math.max(0, Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        receivable.invoiceCodes.push(invoice.code || invoice.id.substring(0, 8).toUpperCase());
        receivable.totalDebt += balance;
        receivable.daysOverdue = Math.max(receivable.daysOverdue, daysOverdue);
      }

      skip += batchSize;
    }

    // Second pass: calculate priority and filter
    const receivables: any[] = [];
    for (const receivable of patientMap.values()) {
      // Calculate priority
      let priority = ReceivablePriority.LOW;
      if (receivable.daysOverdue > 30) {
        priority = ReceivablePriority.HIGH;
      } else if (receivable.daysOverdue > 15) {
        priority = ReceivablePriority.MEDIUM;
      }

      // Apply filters
      if (filters.daysOverdueMin !== undefined && receivable.daysOverdue < filters.daysOverdueMin) {
        continue;
      }
      if (filters.daysOverdueMax !== undefined && receivable.daysOverdue > filters.daysOverdueMax) {
        continue;
      }
      if (filters.priority && priority !== filters.priority) {
        continue;
      }

      receivables.push({
        ...receivable,
        priority,
      });
    }

    // Sort
    receivables.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      if (aValue === undefined || bValue === undefined) return 0;
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Export to CSV
    for (const receivable of receivables) {
      const row = [
        this.escapeCsvValue(receivable.patientName),
        this.escapeCsvValue(receivable.contact),
        this.escapeCsvValue(receivable.invoiceCodes.join('; ')),
        receivable.daysOverdue.toString(),
        receivable.totalDebt.toFixed(2),
        this.translatePriority(receivable.priority),
      ].join(',');

      yield row + '\n';
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Maps invoice to response DTO
   */
  private mapToInvoiceResponse(invoice: any): InvoiceResponseDto {
    const total = Number(invoice.totalAmount);
    const paid = Number(invoice.paidAmount);
    const balance = total - paid;

    return {
      id: invoice.id,
      code: invoice.code,
      patientId: invoice.patientId,
      patientName: invoice.patient?.fullName,
      doctorId: invoice.doctorId,
      doctorName: invoice.doctor?.fullName,
      branchId: invoice.branchId,
      branchName: invoice.branch?.name,
      totalAmount: total,
      discount: Number(invoice.discount),
      paidAmount: paid,
      balance,
      isPaid: invoice.isPaid,
      status: invoice.status,
      createdAt: invoice.createdAt,
      expiresAt: invoice.expiresAt,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
      currency: invoice.currency,
      items: invoice.InvoiceItem?.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        discount: Number(item.discount),
      })),
    };
  }

  /**
   * Maps payment to response DTO
   */
  private mapToPaymentResponse(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      code: payment.id.substring(0, 8).toUpperCase(),
      invoiceId: payment.invoiceId,
      invoiceCode: payment.invoice?.code,
      patientId: payment.invoice?.patientId,
      patientName: payment.invoice?.patient?.fullName,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      reference: payment.reference,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Escapes CSV values
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '';
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Translates invoice status to Spanish
   */
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDING: 'Emitida',
      PAID: 'Pagada',
      CANCELED: 'Cancelada',
      EXPIRED: 'Vencida',
      DELETED: 'Eliminada',
      OTHER: 'Otro',
      OVERDUE: 'Vencida',
    };
    return translations[status] || status;
  }

  /**
   * Translates payment method to Spanish
   */
  private translatePaymentMethod(method: string): string {
    const translations: Record<string, string> = {
      CASH: 'Efectivo',
      CREDIT_CARD: 'Tarjeta Crédito',
      DEBIT_CARD: 'Tarjeta Débito',
      TRANSFER: 'Transferencia',
      OTHER: 'Otro',
    };
    return translations[method] || method;
  }

  /**
   * Translates payment status to Spanish
   */
  private translatePaymentStatus(status: string): string {
    const translations: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Completado',
      CANCELED: 'Cancelado',
      OTHER: 'Otro',
    };
    return translations[status] || status;
  }

  /**
   * Translates priority to Spanish
   */
  private translatePriority(priority: string): string {
    const translations: Record<string, string> = {
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baja',
    };
    return translations[priority] || priority;
  }

  /**
   * Generates a unique invoice code
   */
  private async generateInvoiceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        code: {
          startsWith: `FAC-${year}-`,
        },
      },
    });

    const code = `FAC-${year}-${String(count + 1).padStart(5, '0')}`;

    // Check if code exists (unlikely but safe)
    const existing = await this.prisma.invoice.findFirst({
      where: { code },
    });

    if (existing) {
      // Generate with timestamp if collision
      return `FAC-${year}-${Date.now().toString().slice(-5)}`;
    }

    return code;
  }
}

