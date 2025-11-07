import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSpecializationDto,
  UpdateSpecializationDto,
  SpecializationQueryDto,
  SpecializationResponseDto,
  PaginatedSpecializationResponseDto,
  PaginationMeta,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SpecializationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createSpecializationDto: CreateSpecializationDto,
  ): Promise<SpecializationResponseDto> {
    // Validar que el nombre sea único
    await this.validateUniqueName(createSpecializationDto.name);

    const specialization = await this.prisma.specialization.create({
      data: createSpecializationDto,
    });

    return specialization as SpecializationResponseDto;
  }

  async findAll(
    query: SpecializationQueryDto,
  ): Promise<PaginatedSpecializationResponseDto> {
    const { search, sortBy, sortOrder, page, limit } = query;

    // Construir el where dinámico
    const where: Prisma.SpecializationWhereInput = {};

    // Búsqueda por texto (nombre o descripción)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calcular offset para paginación
    const skip = (+(page || 1) - 1) * +(limit || 10);

    // Consultar datos con paginación
    const [specializations, total] = await Promise.all([
      this.prisma.specialization.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [String(sortBy)]: sortOrder,
        },
      }),
      this.prisma.specialization.count({ where }),
    ]);

    const totalPages = Math.ceil(total / +(limit || 10));

    const meta: PaginationMeta = {
      page: +(page || 1) || 1,
      limit: +(limit || 10) || 10,
      total,
      totalPages,
    };

    return {
      data: specializations as SpecializationResponseDto[],
      meta,
    };
  }

  async findOne(id: string): Promise<SpecializationResponseDto> {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!specialization) {
      throw new NotFoundException(
        `Especialización con ID ${id} no encontrada`,
      );
    }

    return specialization as any;
  }

  async update(
    id: string,
    updateSpecializationDto: UpdateSpecializationDto,
  ): Promise<SpecializationResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    // Si se está actualizando el nombre, validar que sea único
    if (updateSpecializationDto.name) {
      await this.validateUniqueName(updateSpecializationDto.name, id);
    }

    const specialization = await this.prisma.specialization.update({
      where: { id },
      data: updateSpecializationDto,
    });

    return specialization as SpecializationResponseDto;
  }

  async remove(id: string): Promise<void> {
    // Verificar que existe
    await this.findOne(id);

    // Verificar si tiene usuarios asociados
    const usersCount = await this.prisma.user.count({
      where: { specializationId: id },
    });

    if (usersCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la especialización porque tiene ${usersCount} usuario(s) asociado(s)`,
      );
    }

    await this.prisma.specialization.delete({
      where: { id },
    });
  }

  // Métodos auxiliares privados
  private async validateUniqueName(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const where: Prisma.SpecializationWhereInput = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await this.prisma.specialization.findFirst({ where });

    if (existing) {
      throw new ConflictException(
        `Ya existe una especialización con el nombre "${name}"`,
      );
    }
  }
}
