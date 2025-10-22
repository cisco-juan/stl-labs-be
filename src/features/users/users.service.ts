import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  PaginatedUserResponseDto,
  PaginationMeta,
  ChangePasswordDto,
  ResetPasswordDto,
  ChangeStatusDto,
  AssignBranchesDto,
  SetDefaultBranchDto,
  UserWithBranchesDto,
  BranchBasicDto,
} from './dto';
import { Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validar que el email sea único
    await this.validateUniqueEmail(createUserDto.email);

    // Validar que el DNI sea único si se proporciona
    if (createUserDto.dni) {
      await this.validateUniqueDni(createUserDto.dni);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUserResponseDto> {
    const {
      search,
      role,
      status,
      specializationId,
      branchId,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    // Construir el where dinámico
    const where: Prisma.UserWhereInput = {};

    // Búsqueda por texto (nombre, email o DNI)
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (specializationId) {
      where.specializationId = specializationId;
    }

    // Filtro por sucursal (usuarios asignados a esa sucursal)
    if (branchId) {
      where.userBranches = {
        some: {
          branchId: branchId,
        },
      };
    }

    // Calcular skip para paginación
    const skip = (+(page || 1) - 1) * +(limit || 10);

    // Obtener total de registros
    const total = await this.prisma.user.count({ where });

    // Obtener datos paginados
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [String(sortBy)]: sortOrder,
      },
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    // Mapear a UserResponseDto
    const data = users.map((user) => this.mapToUserResponse(user));

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / +(limit || 10));
    const hasNextPage = +(page || 1) < totalPages;
    const hasPreviousPage = +(page || 1) > 1;

    const meta: PaginationMeta = {
      total,
      page: +(page || 1),
      limit: +(limit || 10),
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      data,
      meta,
    };
  }

  async findOne(id: string): Promise<UserWithBranchesDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        specialization: true,
        defaultBranch: true,
        userBranches: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const userResponse = this.mapToUserResponse(user);

    const branches: BranchBasicDto[] = user.userBranches.map((ub) => ({
      id: ub.branch.id,
      name: ub.branch.name,
      code: ub.branch?.code || undefined,
      city: ub.branch?.city || undefined,
      country: ub.branch?.country || undefined,
    }));

    return {
      ...userResponse,
      branches,
      totalBranches: branches.length,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Si se actualiza el email, validar que sea único
    if (updateUserDto.email) {
      await this.validateUniqueEmail(updateUserDto.email, id);
    }

    // Si se actualiza el DNI, validar que sea único
    if (updateUserDto.dni) {
      await this.validateUniqueDni(updateUserDto.dni, id);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async remove(id: string): Promise<UserResponseDto> {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Soft delete: cambiar el status a DELETED
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.DELETED },
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Actualizar la contraseña
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Actualizar la contraseña
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña reseteada exitosamente' };
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeStatusDto,
  ): Promise<UserResponseDto> {
    // Verificar que el usuario exists
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: changeStatusDto.status },
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async assignBranches(
    userId: string,
    assignBranchesDto: AssignBranchesDto,
  ): Promise<{ message: string; assigned: number }> {
    // Verificar que el usuario existe
    await this.findOne(userId);

    // Verificar que todas las sucursales existen
    for (const branchId of assignBranchesDto.branchIds) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        throw new NotFoundException(
          `Sucursal con ID ${branchId} no encontrada`,
        );
      }
    }

    // Asignar sucursales (evitar duplicados usando createMany con skipDuplicates)
    const assignments = assignBranchesDto.branchIds.map((branchId) => ({
      userId,
      branchId,
    }));

    const result = await this.prisma.userBranch.createMany({
      data: assignments,
      skipDuplicates: true,
    });

    return {
      message: 'Sucursales asignadas exitosamente',
      assigned: result.count,
    };
  }

  async removeBranch(
    userId: string,
    branchId: string,
  ): Promise<{ message: string }> {
    // Verificar que el usuario existe
    await this.findOne(userId);

    // Verificar que la asignación existe
    const assignment = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `El usuario no está asignado a esta sucursal`,
      );
    }

    // Eliminar la asignación
    await this.prisma.userBranch.delete({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    return { message: 'Sucursal desasignada exitosamente' };
  }

  async getUserBranches(userId: string, page: number = 1, limit: number = 10) {
    // Verificar que el usuario existe
    await this.findOne(userId);

    const skip = (page - 1) * limit;

    // Contar total de sucursales asignadas
    const total = await this.prisma.userBranch.count({
      where: { userId },
    });

    // Obtener sucursales asignadas
    const userBranches = await this.prisma.userBranch.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        branch: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const branches: BranchBasicDto[] = userBranches.map((ub) => ({
      id: ub.branch.id,
      name: ub.branch.name,
      code: ub.branch.code || undefined,
      city: ub.branch.city || undefined,
      country: ub.branch.country || undefined,
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      data: branches,
      meta,
    };
  }

  async setDefaultBranch(
    userId: string,
    setDefaultBranchDto: SetDefaultBranchDto,
  ): Promise<UserResponseDto> {
    // Verificar que el usuario existe
    await this.findOne(userId);

    // Verificar que la sucursal existe
    const branch = await this.prisma.branch.findUnique({
      where: { id: setDefaultBranchDto.branchId },
    });

    if (!branch) {
      throw new NotFoundException(
        `Sucursal con ID ${setDefaultBranchDto.branchId} no encontrada`,
      );
    }

    // Verificar que el usuario está asignado a esa sucursal
    const assignment = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId: setDefaultBranchDto.branchId,
        },
      },
    });

    if (!assignment) {
      throw new BadRequestException(
        'El usuario debe estar asignado a la sucursal antes de establecerla como predeterminada',
      );
    }

    // Actualizar la sucursal por defecto
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { defaultBranchId: setDefaultBranchDto.branchId },
      include: {
        specialization: true,
        defaultBranch: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  // Métodos privados de validación

  private async validateUniqueEmail(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.UserWhereInput = { email };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingUser = await this.prisma.user.findFirst({ where });

    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email ${email}`);
    }
  }

  private async validateUniqueDni(
    dni: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.UserWhereInput = { dni };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingUser = await this.prisma.user.findFirst({ where });

    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el DNI ${dni}`);
    }
  }

  // Método privado para mapear a UserResponseDto (sin password)
  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      gender: user.gender,
      status: user.status,
      phoneNumber: user.phoneNumber,
      dni: user.dni,
      address: user.address,
      profilePictureUrl: user.profilePictureUrl,
      specializationId: user.specializationId,
      specializationName: user.specialization?.name,
      defaultBranchId: user.defaultBranchId,
      defaultBranchName: user.defaultBranch?.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
