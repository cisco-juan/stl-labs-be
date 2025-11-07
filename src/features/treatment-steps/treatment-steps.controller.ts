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
import { TreatmentStepsService } from './treatment-steps.service';
import {
  CreateTreatmentStepDto,
  UpdateTreatmentStepDto,
  TreatmentStepQueryDto,
  TreatmentStepResponseDto,
  PaginatedTreatmentStepResponseDto,
  ChangeTreatmentStepStatusDto,
  ReorderTreatmentStepsDto,
} from './dto';

@ApiTags('Pasos de Tratamiento')
@Controller('treatment-steps')
export class TreatmentStepsController {
  constructor(
    private readonly treatmentStepsService: TreatmentStepsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo paso de tratamiento' })
  @ApiResponse({
    status: 201,
    description: 'Paso creado exitosamente',
    type: TreatmentStepResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Tratamiento o médico no encontrado' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTreatmentStepDto,
  ): Promise<TreatmentStepResponseDto> {
    return this.treatmentStepsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pasos de tratamiento con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pasos',
    type: PaginatedTreatmentStepResponseDto,
  })
  async findAll(
    @Query() query: TreatmentStepQueryDto,
  ): Promise<PaginatedTreatmentStepResponseDto> {
    return this.treatmentStepsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paso de tratamiento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso encontrado',
    type: TreatmentStepResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TreatmentStepResponseDto> {
    return this.treatmentStepsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un paso de tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso actualizado exitosamente',
    type: TreatmentStepResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTreatmentStepDto,
  ): Promise<TreatmentStepResponseDto> {
    return this.treatmentStepsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado de un paso de tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: TreatmentStepResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeTreatmentStepStatusDto,
  ): Promise<TreatmentStepResponseDto> {
    return this.treatmentStepsService.changeStatus(id, changeStatusDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar un paso como completado' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paso completado exitosamente',
    type: TreatmentStepResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TreatmentStepResponseDto> {
    return this.treatmentStepsService.complete(id);
  }

  @Patch('reorder/:treatmentId')
  @ApiOperation({ summary: 'Reordenar pasos de un tratamiento' })
  @ApiParam({
    name: 'treatmentId',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Pasos reordenados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async reorder(
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
    @Body() reorderDto: ReorderTreatmentStepsDto,
  ): Promise<void> {
    return this.treatmentStepsService.reorder(treatmentId, reorderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un paso de tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID del paso',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Paso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Paso no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.treatmentStepsService.remove(id);
  }
}

