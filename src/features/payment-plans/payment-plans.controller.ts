import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentPlansService } from './payment-plans.service';
import {
  CreatePaymentPlanDto,
  UpdatePaymentPlanDto,
  PaymentPlanQueryDto,
  PaymentPlanResponseDto,
  PaymentSummaryResponseDto,
  PayInstallmentDto,
  PaymentInstallmentResponseDto,
} from './dto';

@ApiTags('Planes de Pago')
@Controller('payment-plans')
export class PaymentPlansController {
  constructor(private readonly paymentPlansService: PaymentPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo plan de pago' })
  @ApiResponse({
    status: 201,
    description: 'Plan de pago creado exitosamente',
    type: PaymentPlanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePaymentPlanDto,
  ): Promise<PaymentPlanResponseDto> {
    return this.paymentPlansService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar planes de pago' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planes de pago',
    type: [PaymentPlanResponseDto],
  })
  async findAll(
    @Query() query: PaymentPlanQueryDto,
  ): Promise<PaymentPlanResponseDto[]> {
    return this.paymentPlansService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un plan de pago por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del plan de pago',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan de pago encontrado',
    type: PaymentPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentPlanResponseDto> {
    return this.paymentPlansService.findOne(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Obtener resumen de pagos de un plan' })
  @ApiParam({
    name: 'id',
    description: 'ID del plan de pago',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de pagos',
    type: PaymentSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  async getSummary(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentSummaryResponseDto> {
    return this.paymentPlansService.getPaymentSummary(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un plan de pago' })
  @ApiParam({
    name: 'id',
    description: 'ID del plan de pago',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan de pago actualizado exitosamente',
    type: PaymentPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePaymentPlanDto,
  ): Promise<PaymentPlanResponseDto> {
    return this.paymentPlansService.update(id, updateDto);
  }

  @Patch(':id/installments/:installmentId/pay')
  @ApiOperation({ summary: 'Marcar una cuota como pagada' })
  @ApiParam({
    name: 'id',
    description: 'ID del plan de pago',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'installmentId',
    description: 'ID de la cuota',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuota marcada como pagada exitosamente',
    type: PaymentInstallmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan o cuota no encontrado' })
  @ApiResponse({ status: 400, description: 'La cuota ya está pagada' })
  async payInstallment(
    @Param('id', ParseUUIDPipe) planId: string,
    @Param('installmentId', ParseUUIDPipe) installmentId: string,
    @Body() payDto: PayInstallmentDto,
  ): Promise<PaymentInstallmentResponseDto> {
    return this.paymentPlansService.markInstallmentPaid(
      planId,
      installmentId,
      payDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un plan de pago' })
  @ApiParam({
    name: 'id',
    description: 'ID del plan de pago',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Plan de pago eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Plan de pago no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene cuotas pagadas',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.paymentPlansService.remove(id);
  }
}

