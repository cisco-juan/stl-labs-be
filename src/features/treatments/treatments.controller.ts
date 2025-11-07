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
import { TreatmentsService } from './treatments.service';
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
} from './dto';

@ApiTags('Tratamientos')
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tratamiento' })
  @ApiResponse({
    status: 201,
    description: 'Tratamiento creado exitosamente',
    type: TreatmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente, médico o sucursal no encontrado' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tratamientos con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos',
    type: PaginatedTreatmentResponseDto,
  })
  async findAll(
    @Query() query: TreatmentQueryDto,
  ): Promise<PaginatedTreatmentResponseDto> {
    return this.treatmentsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de tratamientos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de tratamientos',
    type: TreatmentStatisticsResponseDto,
  })
  async getStatistics(
    @Query() query: TreatmentStatisticsQueryDto,
  ): Promise<TreatmentStatisticsResponseDto> {
    return this.treatmentsService.getStatistics(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tratamiento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento encontrado',
    type: TreatmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.findOne(id);
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'Obtener pasos de un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pasos del tratamiento',
  })
  async getSteps(@Param('id', ParseUUIDPipe) id: string) {
    // This will be implemented when TreatmentSteps module is created
    // For now, return a placeholder
    await this.treatmentsService.findOne(id);
    return { message: 'Módulo de pasos de tratamiento pendiente de implementar' };
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Obtener citas vinculadas a un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas del tratamiento',
  })
  async getAppointments(@Param('id', ParseUUIDPipe) id: string) {
    await this.treatmentsService.findOne(id);
    // This would require integration with AppointmentsService
    return { message: 'Integración con citas pendiente' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento actualizado exitosamente',
    type: TreatmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado de un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: TreatmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeTreatmentStatusDto,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.changeStatus(id, changeStatusDto);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Actualizar estado de pago de un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de pago actualizado exitosamente',
    type: TreatmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  async updatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdateTreatmentPaymentDto,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.updatePaymentStatus(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Tratamiento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar porque tiene pasos activos',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.treatmentsService.remove(id);
  }
}

