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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserQueryDto,
  PaginatedUserResponseDto,
  ChangePasswordDto,
  ResetPasswordDto,
  ChangeStatusDto,
  AssignBranchesDto,
  SetDefaultBranchDto,
  UserWithBranchesDto,
} from './dto';
import { BranchBasicDto } from './dto/user-with-branches.dto';
import { PaginationMeta } from './dto/paginated-user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email o DNI ya existe',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos los usuarios con filtros y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: PaginatedUserResponseDto,
  })
  async findAll(
    @Query() query: UserQueryDto,
  ): Promise<PaginatedUserResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por ID con sus sucursales' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
    type: UserWithBranchesDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserWithBranchesDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El email o DNI ya existe',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(id);
  }

  @Patch(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetear contraseña del usuario (solo administradores)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña reseteada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.resetPassword(id, resetPasswordDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar el estado del usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ): Promise<UserResponseDto> {
    return this.usersService.changeStatus(id, changeStatusDto);
  }

  @Post(':id/branches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar sucursales a un usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Sucursales asignadas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o sucursal no encontrado',
  })
  async assignBranches(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() assignBranchesDto: AssignBranchesDto,
  ): Promise<{ message: string; assigned: number }> {
    return this.usersService.assignBranches(userId, assignBranchesDto);
  }

  @Delete(':id/branches/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitar una sucursal de un usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'branchId',
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursal desasignada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o no está asignado a esa sucursal',
  })
  async removeBranch(
    @Param('id', ParseUUIDPipe) userId: string,
    @Param('branchId', ParseUUIDPipe) branchId: string,
  ): Promise<{ message: string }> {
    return this.usersService.removeBranch(userId, branchId);
  }

  @Get(':id/branches')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar sucursales asignadas a un usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
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
    description: 'Lista de sucursales obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserBranches(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: BranchBasicDto[]; meta: PaginationMeta }> {
    return this.usersService.getUserBranches(userId, page, limit);
  }

  @Patch(':id/default-branch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Establecer sucursal por defecto del usuario' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursal por defecto actualizada exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario debe estar asignado a la sucursal primero',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o sucursal no encontrado',
  })
  async setDefaultBranch(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() setDefaultBranchDto: SetDefaultBranchDto,
  ): Promise<UserResponseDto> {
    return this.usersService.setDefaultBranch(userId, setDefaultBranchDto);
  }
}
