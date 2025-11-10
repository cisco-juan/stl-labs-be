import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
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
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ChangeInvoiceStatusDto,
  CreatePaymentDto,
} from './dto';

@ApiTags('Facturación')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ==================== INVOICES ====================

  @Post('invoices')
  @ApiOperation({ summary: 'Crear nueva factura' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'Factura creada exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente, tratamiento o paso no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.billingService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Obtener listado de facturas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de facturas obtenido exitosamente',
    type: PaginatedInvoiceResponseDto,
  })
  async findAllInvoices(
    @Query() query: InvoiceQueryDto,
  ): Promise<PaginatedInvoiceResponseDto> {
    return this.billingService.findAllInvoices(query);
  }

  @Get('invoices/export/csv')
  @ApiOperation({ summary: 'Exportar facturas a CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV con las facturas',
  })
  async exportInvoicesCsv(
    @Query() query: InvoiceQueryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="facturas_${new Date().toISOString().split('T')[0]}.csv"`,
    );

    // Stream CSV data in batches
    for await (const chunk of this.billingService.exportInvoicesToCsv(query)) {
      res.write(chunk);
    }

    res.end();
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Obtener detalles de una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la factura',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getInvoiceDetails(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponseDto> {
    return this.billingService.getInvoiceDetails(id);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: 'Actualizar factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Factura actualizada exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede actualizar una factura pagada' })
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.billingService.updateInvoice(id, updateInvoiceDto);
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiBody({ type: ChangeInvoiceStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Estado de factura actualizado exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 400, description: 'No se puede cambiar el estado de una factura pagada' })
  async changeInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeInvoiceStatusDto,
  ): Promise<InvoiceResponseDto> {
    return this.billingService.changeInvoiceStatus(id, changeStatusDto);
  }

  @Get('invoices/:id/payments')
  @ApiOperation({ summary: 'Obtener pagos de una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: 200,
    description: 'Listado de pagos de la factura',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getInvoicePayments(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto[]> {
    return this.billingService.getInvoicePayments(id);
  }

  @Get('invoices/:id/pdf')
  @ApiOperation({ summary: 'Descargar PDF de factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({
    status: 200,
    description: 'PDF de la factura',
    content: {
      'application/pdf': {},
    },
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async downloadInvoicePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.billingService.generateInvoicePdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="factura_${id.substring(0, 8)}.pdf"`,
    );

    res.send(pdfBuffer);
  }

  // ==================== PAYMENTS ====================

  @Post('payments')
  @ApiOperation({ summary: 'Crear nuevo pago' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Pago creado exitosamente',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 400, description: 'La factura ya está pagada o el pago excede el total' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.billingService.createPayment(createPaymentDto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Obtener listado de pagos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de pagos obtenido exitosamente',
    type: PaginatedPaymentResponseDto,
  })
  async findAllPayments(
    @Query() query: PaymentQueryDto,
  ): Promise<PaginatedPaymentResponseDto> {
    return this.billingService.findAllPayments(query);
  }

  @Get('payments/export/csv')
  @ApiOperation({ summary: 'Exportar pagos a CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV con los pagos',
  })
  async exportPaymentsCsv(
    @Query() query: PaymentQueryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pagos_${new Date().toISOString().split('T')[0]}.csv"`,
    );

    // Stream CSV data in batches
    for await (const chunk of this.billingService.exportPaymentsToCsv(query)) {
      res.write(chunk);
    }

    res.end();
  }

  @Get('payments/:id/pdf')
  @ApiOperation({ summary: 'Descargar PDF de recibo de pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: 200,
    description: 'PDF del recibo de pago',
    content: {
      'application/pdf': {},
    },
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async downloadPaymentReceiptPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.billingService.generatePaymentReceiptPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recibo_${id.substring(0, 8)}.pdf"`,
    );

    res.send(pdfBuffer);
  }

  // ==================== ACCOUNTS RECEIVABLE ====================

  @Get('accounts-receivable')
  @ApiOperation({ summary: 'Obtener listado de cuentas por cobrar' })
  @ApiResponse({
    status: 200,
    description: 'Listado de cuentas por cobrar obtenido exitosamente',
    type: PaginatedAccountsReceivableResponseDto,
  })
  async findAllAccountsReceivable(
    @Query() query: AccountsReceivableQueryDto,
  ): Promise<PaginatedAccountsReceivableResponseDto> {
    return this.billingService.findAllAccountsReceivable(query);
  }

  @Get('accounts-receivable/export/csv')
  @ApiOperation({ summary: 'Exportar cuentas por cobrar a CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV con las cuentas por cobrar',
  })
  async exportAccountsReceivableCsv(
    @Query() query: AccountsReceivableQueryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cuentas_por_cobrar_${new Date().toISOString().split('T')[0]}.csv"`,
    );

    // Stream CSV data in batches
    for await (const chunk of this.billingService.exportAccountsReceivableToCsv(query)) {
      res.write(chunk);
    }

    res.end();
  }
}

