import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import {
  BranchResponseDto,
  PaginatedBranchResponseDto,
  PaginationMeta,
} from './dto';
import { BranchStatus, Prisma } from '@prisma/client';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto): Promise<BranchResponseDto> {
    // Validar que el código sea único si se proporciona
    if (createBranchDto.code) {
      await this.validateUniqueCode(createBranchDto.code);
    }

    const branch = await this.prisma.branch.create({
      data: createBranchDto,
    });

    return branch as BranchResponseDto;
  }

  async findAll(
    query: BranchQueryDto,
  ): Promise<PaginatedBranchResponseDto> {
    const { search, status, city, country, sortBy, sortOrder, page, limit } =
      query;


    // Construir el where dinámico
    const where: Prisma.BranchWhereInput = {};

    // Búsqueda por texto (nombre, código o ciudad)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    // Calcular skip para paginación
    const skip = (+(page || 1) - 1) * +(limit || 10);

    // Obtener total de registros
    const total = await this.prisma.branch.count({ where });

    // Obtener datos paginados
    const branches = await this.prisma.branch.findMany({
      where,
      skip,
      take: +(limit || 10),
      orderBy: sortBy
        ? { [String(sortBy)]: sortOrder }
        : undefined,
    });
    const totalPages = Math.ceil(total / +(limit || 10));
    const hasNextPage = +(page || 1) < totalPages;
    const hasPreviousPage = (page || 1) > 1;

    const meta: PaginationMeta = {
      total,
      page: +(page || 1),
      limit: +(limit || 10),
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      data: branches as BranchResponseDto[],
      meta,
    };
  }

  async findOne(id: string): Promise<BranchResponseDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    return branch as BranchResponseDto;
  }

  async update(
    id: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    // Verificar que la sucursal existe
    await this.findOne(id);

    // Si se actualiza el código, validar que sea único
    if (updateBranchDto.code) {
      await this.validateUniqueCode(updateBranchDto.code, id);
    }

    const branch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });

    return branch as BranchResponseDto;
  }

  async remove(id: string): Promise<BranchResponseDto> {
    // Verificar que la sucursal existe
    await this.findOne(id);

    // Soft delete: cambiar el status a DELETED
    const branch = await this.prisma.branch.update({
      where: { id },
      data: { status: BranchStatus.DELETED },
    });

    return branch as BranchResponseDto;
  }

  async assignUser(branchId: string, userId: string): Promise<void> {
    // Verificar que la sucursal existe
    await this.findOne(branchId);

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que el usuario no esté ya asignado
    const existingAssignment = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `El usuario ya está asignado a esta sucursal`,
      );
    }

    // Crear la asignación
    await this.prisma.userBranch.create({
      data: {
        userId,
        branchId,
      },
    });
  }

  async unassignUser(branchId: string, userId: string): Promise<void> {
    // Verificar que la sucursal existe
    await this.findOne(branchId);

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
  }

  async findUsersByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Verificar que la sucursal existe
    await this.findOne(branchId);

    const skip = (page - 1) * limit;

    // Contar total de usuarios asignados
    const total = await this.prisma.userBranch.count({
      where: { branchId },
    });

    // Obtener usuarios asignados con sus datos
    const userBranches = await this.prisma.userBranch.findMany({
      where: { branchId },
      skip,
      take: limit,
      include: {
        user: {
          include: {
            specialization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const users = userBranches.map((ub) => ({
      id: ub.user.id,
      fullName: ub.user.fullName,
      email: ub.user.email,
      role: ub.user.role,
      gender: ub.user.gender,
      status: ub.user.status,
      phoneNumber: ub.user.phoneNumber,
      specializationName: ub.user.specialization?.name,
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
      data: users,
      meta,
    };
  }

  async findAvailableUsers(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Verificar que la sucursal existe
    await this.findOne(branchId);

    const skip = (page - 1) * limit;

    // Obtener IDs de usuarios ya asignados a esta sucursal
    const assignedUserIds = await this.prisma.userBranch
      .findMany({
        where: { branchId },
        select: { userId: true },
      })
      .then((assignments) => assignments.map((a) => a.userId));

    // Contar usuarios disponibles (no asignados y activos)
    const total = await this.prisma.user.count({
      where: {
        id: { notIn: assignedUserIds },
        status: { not: 'DELETED' },
      },
    });

    // Obtener usuarios disponibles
    const users = await this.prisma.user.findMany({
      where: {
        id: { notIn: assignedUserIds },
        status: { not: 'DELETED' },
      },
      skip,
      take: limit,
      include: {
        specialization: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    const userData = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      gender: user.gender,
      status: user.status,
      phoneNumber: user.phoneNumber,
      specializationName: user.specialization?.name,
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
      data: userData,
      meta,
    };
  }

  private async validateUniqueCode(
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.BranchWhereInput = { code };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingBranch = await this.prisma.branch.findFirst({ where });

    if (existingBranch) {
      throw new ConflictException(
        `Ya existe una sucursal con el código ${code}`,
      );
    }
  }
}
