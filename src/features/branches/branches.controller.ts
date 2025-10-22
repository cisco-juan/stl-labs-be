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
import { BranchesService } from './branches.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  BranchResponseDto,
  BranchQueryDto,
  PaginatedBranchResponseDto,
  AssignUserDto,
  PaginatedUserResponseDto,
} from './dto';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva sucursal' })
  @ApiResponse({
    status: 201,
    description: 'Sucursal creada exitosamente',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El código de sucursal ya existe',
  })
  async create(
    @Body() createBranchDto: CreateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las sucursales con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de sucursales obtenida exitosamente',
    type: PaginatedBranchResponseDto,
  })
  async findAll(
    @Query() query: BranchQueryDto,
  ): Promise<PaginatedBranchResponseDto> {
    return this.branchesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una sucursal por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursal obtenida exitosamente',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una sucursal' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursal actualizada exitosamente',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'El código de sucursal ya existe',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una sucursal (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursal eliminada exitosamente',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchesService.remove(id);
  }

  @Post(':id/users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar un usuario a una sucursal' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario asignado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal o usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya está asignado a esta sucursal',
  })
  async assignUser(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Body() assignUserDto: AssignUserDto,
  ): Promise<{ message: string }> {
    await this.branchesService.assignUser(branchId, assignUserDto.userId);
    return { message: 'Usuario asignado exitosamente' };
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desasignar un usuario de una sucursal' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario desasignado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada o usuario no asignado',
  })
  async unassignUser(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<{ message: string }> {
    await this.branchesService.unassignUser(branchId, userId);
    return { message: 'Usuario desasignado exitosamente' };
  }

  @Get(':id/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar usuarios asignados a una sucursal' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: PaginatedUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada',
  })
  async findUsersByBranch(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedUserResponseDto> {
    return this.branchesService.findUsersByBranch(branchId, page, limit) as Promise<PaginatedUserResponseDto>;
  }

  @Get(':id/available-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar usuarios disponibles para asignar a una sucursal' })
  @ApiParam({
    name: 'id',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios disponibles obtenida exitosamente',
    type: PaginatedUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sucursal no encontrada',
  })
  async findAvailableUsers(
    @Param('id', ParseUUIDPipe) branchId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedUserResponseDto> {
    return this.branchesService.findAvailableUsers(branchId, page, limit) as Promise<PaginatedUserResponseDto>;
  }
}
