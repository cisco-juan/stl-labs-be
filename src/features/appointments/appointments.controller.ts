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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  AppointmentCalendarQueryDto,
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
  ChangeStatusDto,
  AppointmentTypeResponseDto,
} from './dto';

@ApiTags('Citas')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ==================== CRUD BÁSICO ====================

  @Post()
  @ApiOperation({ summary: 'Crear nueva cita' })
  @ApiResponse({
    status: 201,
    description: 'Cita creada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente, médico o tipo de cita no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario con otra cita del médico' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas',
    type: PaginatedAppointmentResponseDto,
  })
  async findAll(
    @Query() query: AppointmentQueryDto,
  ): Promise<PaginatedAppointmentResponseDto> {
    return this.appointmentsService.findAll(query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obtener citas para vista calendario (hoy/semana/mes)' })
  @ApiResponse({
    status: 200,
    description: 'Citas para la vista de calendario',
  })
  async findForCalendar(@Query() query: AppointmentCalendarQueryDto) {
    return this.appointmentsService.findForCalendar(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Listar citas pendientes' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas pendientes',
  })
  async findPending(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.appointmentsService.findPending(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la cita',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: 200,
    description: 'Cita actualizada exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado de la cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateStatus(id, changeStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cita' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  @ApiResponse({
    status: 200,
    description: 'Cita eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.remove(id);
  }

  // ==================== CITAS POR ENTIDAD ====================

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener citas de un paciente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Citas del paciente',
  })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.appointmentsService.findByPatient(patientId, page, limit);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Obtener citas de un médico' })
  @ApiParam({ name: 'doctorId', description: 'ID del médico' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Citas del médico',
  })
  async findByDoctor(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.appointmentsService.findByDoctor(doctorId, page, limit);
  }
}

// ==================== TIPOS DE CITAS ====================

@ApiTags('Tipos de Citas')
@Controller('appointment-types')
export class AppointmentTypesController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de citas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de citas',
    type: [AppointmentTypeResponseDto],
  })
  async findAll(): Promise<AppointmentTypeResponseDto[]> {
    return this.appointmentsService.findAllAppointmentTypes();
  }
}
