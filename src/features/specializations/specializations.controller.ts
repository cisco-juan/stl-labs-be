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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SpecializationsService } from './specializations.service';
import {
  CreateSpecializationDto,
  UpdateSpecializationDto,
  SpecializationQueryDto,
  SpecializationResponseDto,
  PaginatedSpecializationResponseDto,
} from './dto';

@ApiTags('Specializations')
@Controller('specializations')
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva especialización' })
  @ApiBody({ type: CreateSpecializationDto })
  @ApiResponse({
    status: 201,
    description: 'Especialización creada exitosamente',
    type: SpecializationResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una especialización con ese nombre',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() createSpecializationDto: CreateSpecializationDto,
  ): Promise<SpecializationResponseDto> {
    return this.specializationsService.create(createSpecializationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las especializaciones con paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de especializaciones',
    type: PaginatedSpecializationResponseDto,
  })
  findAll(
    @Query() query: SpecializationQueryDto,
  ): Promise<PaginatedSpecializationResponseDto> {
    return this.specializationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especialización por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la especialización',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Especialización encontrada',
    type: SpecializationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Especialización no encontrada' })
  findOne(@Param('id') id: string): Promise<SpecializationResponseDto> {
    return this.specializationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una especialización' })
  @ApiParam({
    name: 'id',
    description: 'ID de la especialización',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateSpecializationDto })
  @ApiResponse({
    status: 200,
    description: 'Especialización actualizada exitosamente',
    type: SpecializationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Especialización no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una especialización con ese nombre',
  })
  update(
    @Param('id') id: string,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
  ): Promise<SpecializationResponseDto> {
    return this.specializationsService.update(id, updateSpecializationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una especialización' })
  @ApiParam({
    name: 'id',
    description: 'ID de la especialización',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Especialización eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Especialización no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque tiene usuarios asociados',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.specializationsService.remove(id);
  }
}
