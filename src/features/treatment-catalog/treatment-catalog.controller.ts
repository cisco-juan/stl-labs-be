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
import { TreatmentCatalogService } from './treatment-catalog.service';
import {
  CreateTreatmentCatalogDto,
  UpdateTreatmentCatalogDto,
  TreatmentCatalogQueryDto,
  TreatmentCatalogResponseDto,
  PaginatedTreatmentCatalogResponseDto,
  TreatmentCatalogStatisticsResponseDto,
} from './dto';

@ApiTags('Catálogo de Tratamientos')
@Controller('treatment-catalog')
export class TreatmentCatalogController {
  constructor(
    private readonly treatmentCatalogService: TreatmentCatalogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tratamiento en el catálogo' })
  @ApiResponse({
    status: 201,
    description: 'Tratamiento creado exitosamente',
    type: TreatmentCatalogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Código ya existe' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTreatmentCatalogDto,
  ): Promise<TreatmentCatalogResponseDto> {
    return this.treatmentCatalogService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tratamientos del catálogo con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos',
    type: PaginatedTreatmentCatalogResponseDto,
  })
  async findAll(
    @Query() query: TreatmentCatalogQueryDto,
  ): Promise<PaginatedTreatmentCatalogResponseDto> {
    return this.treatmentCatalogService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas del catálogo de tratamientos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del catálogo',
    type: TreatmentCatalogStatisticsResponseDto,
  })
  async getStatistics(): Promise<TreatmentCatalogStatisticsResponseDto> {
    return this.treatmentCatalogService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tratamiento del catálogo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento encontrado',
    type: TreatmentCatalogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TreatmentCatalogResponseDto> {
    return this.treatmentCatalogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tratamiento del catálogo' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento actualizado exitosamente',
    type: TreatmentCatalogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Código ya existe' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTreatmentCatalogDto,
  ): Promise<TreatmentCatalogResponseDto> {
    return this.treatmentCatalogService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tratamiento del catálogo' })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Tratamiento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque está en uso',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.treatmentCatalogService.remove(id);
  }
}

