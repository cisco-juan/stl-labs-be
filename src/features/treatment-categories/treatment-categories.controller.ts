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
import { TreatmentCategoriesService } from './treatment-categories.service';
import {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoryQueryDto,
  TreatmentCategoryResponseDto,
  PaginatedTreatmentCategoryResponseDto,
  TreatmentCategoryStatisticsResponseDto,
} from './dto';

@ApiTags('Categorías de Tratamientos')
@Controller('treatment-categories')
export class TreatmentCategoriesController {
  constructor(
    private readonly treatmentCategoriesService: TreatmentCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría de tratamiento' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: TreatmentCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body() createDto: CreateTreatmentCategoryDto,
  ): Promise<TreatmentCategoryResponseDto> {
    return this.treatmentCategoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías de tratamientos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    type: PaginatedTreatmentCategoryResponseDto,
  })
  async findAll(
    @Query() query: TreatmentCategoryQueryDto,
  ): Promise<PaginatedTreatmentCategoryResponseDto> {
    return this.treatmentCategoriesService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de categorías de tratamientos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de categorías',
    type: TreatmentCategoryStatisticsResponseDto,
  })
  async getStatistics(): Promise<TreatmentCategoryStatisticsResponseDto> {
    return this.treatmentCategoriesService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: TreatmentCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TreatmentCategoryResponseDto> {
    return this.treatmentCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría de tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: TreatmentCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTreatmentCategoryDto,
  ): Promise<TreatmentCategoryResponseDto> {
    return this.treatmentCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría de tratamiento' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.treatmentCategoriesService.remove(id);
  }
}
