import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTreatmentCatalogDto,
  UpdateTreatmentCatalogDto,
  TreatmentCatalogQueryDto,
  TreatmentCatalogResponseDto,
  PaginatedTreatmentCatalogResponseDto,
  TreatmentCatalogStatisticsResponseDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TreatmentCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new treatment catalog item
   */
  async create(
    createDto: CreateTreatmentCatalogDto,
  ): Promise<TreatmentCatalogResponseDto> {
    // Check if code already exists
    const existing = await this.prisma.treatmentCatalog.findUnique({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tratamiento con el código: ${createDto.code}`,
      );
    }

    // Validate category exists if provided
    if (createDto.categoryId) {
      const category = await this.prisma.treatmentCategory.findUnique({
        where: { id: createDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría de tratamiento no encontrada');
      }
    }

    const catalog = await this.prisma.treatmentCatalog.create({
      data: {
        code: createDto.code,
        name: createDto.name,
        description: createDto.description,
        categoryId: createDto.categoryId,
        basePrice: createDto.basePrice ?? 0,
        estimatedDuration: createDto.estimatedDuration ?? 0,
        requiresAnesthesia: createDto.requiresAnesthesia ?? false,
        isActive: createDto.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { TreatmentStep: true },
        },
      },
    });

    return this.mapToResponse(catalog);
  }

  /**
   * Find all treatment catalog items with pagination and filters
   */
  async findAll(
    query: TreatmentCatalogQueryDto,
  ): Promise<PaginatedTreatmentCatalogResponseDto> {
    const { page = 1, limit = 10, search, isActive, categoryId, requiresAnesthesia } =
      query;
    const skip = (+(page || 1) - 1) * +(limit || 10);

    const where: Prisma.TreatmentCatalogWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (requiresAnesthesia !== undefined) {
      where.requiresAnesthesia = requiresAnesthesia;
    }

    const [catalogItems, total] = await Promise.all([
      this.prisma.treatmentCatalog.findMany({
        where,
        skip,
        take: +(limit || 10),
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { TreatmentStep: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.treatmentCatalog.count({ where }),
    ]);

    return {
      data: catalogItems.map((item) => this.mapToResponse(item)),
      meta: {
        total,
        page: +(page || 1),
        limit: +(limit || 10),
        totalPages: Math.ceil(total / +(limit || 10)) || 1
      },
    };
  }

  /**
   * Find a single treatment catalog item by ID
   */
  async findOne(id: string): Promise<TreatmentCatalogResponseDto> {
    const catalog = await this.prisma.treatmentCatalog.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { TreatmentStep: true },
        },
      },
    });

    if (!catalog) {
      throw new NotFoundException('Tratamiento del catálogo no encontrado');
    }

    return this.mapToResponse(catalog);
  }

  /**
   * Update a treatment catalog item
   */
  async update(
    id: string,
    updateDto: UpdateTreatmentCatalogDto,
  ): Promise<TreatmentCatalogResponseDto> {
    // Check if catalog exists
    const existing = await this.prisma.treatmentCatalog.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Tratamiento del catálogo no encontrado');
    }

    // Check if code is being updated and if it conflicts
    if (updateDto.code && updateDto.code !== existing.code) {
      const codeExists = await this.prisma.treatmentCatalog.findUnique({
        where: { code: updateDto.code },
      });

      if (codeExists) {
        throw new ConflictException(
          `Ya existe un tratamiento con el código: ${updateDto.code}`,
        );
      }
    }

    // Validate category exists if provided
    if (updateDto.categoryId) {
      const category = await this.prisma.treatmentCategory.findUnique({
        where: { id: updateDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría de tratamiento no encontrada');
      }
    }

    const catalog = await this.prisma.treatmentCatalog.update({
      where: { id },
      data: updateDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { TreatmentStep: true },
        },
      },
    });

    return this.mapToResponse(catalog);
  }

  /**
   * Delete a treatment catalog item
   */
  async remove(id: string): Promise<void> {
    // Check if catalog exists
    const catalog = await this.prisma.treatmentCatalog.findUnique({
      where: { id },
      include: {
        _count: {
          select: { TreatmentStep: true },
        },
      },
    });

    if (!catalog) {
      throw new NotFoundException('Tratamiento del catálogo no encontrado');
    }

    // Check if it's being used in treatment steps
    if (catalog._count.TreatmentStep > 0) {
      throw new ConflictException(
        'No se puede eliminar el tratamiento porque está siendo utilizado en pasos de tratamiento',
      );
    }

    await this.prisma.treatmentCatalog.delete({
      where: { id },
    });
  }

  /**
   * Get statistics for treatment catalog
   */
  async getStatistics(): Promise<TreatmentCatalogStatisticsResponseDto> {
    const [
      totalTreatments,
      activeTreatments,
      inactiveTreatments,
      treatmentsRequiringAnesthesia,
      catalogItems,
      priceStats,
      durationStats,
    ] = await Promise.all([
      this.prisma.treatmentCatalog.count(),
      this.prisma.treatmentCatalog.count({ where: { isActive: true } }),
      this.prisma.treatmentCatalog.count({ where: { isActive: false } }),
      this.prisma.treatmentCatalog.count({
        where: { requiresAnesthesia: true },
      }),
      this.prisma.treatmentCatalog.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { TreatmentStep: true },
          },
        },
      }),
      this.prisma.treatmentCatalog.aggregate({
        _avg: {
          basePrice: true,
        },
      }),
      this.prisma.treatmentCatalog.aggregate({
        _avg: {
          estimatedDuration: true,
        },
      }),
    ]);

    // Group by category
    const categoryMap = new Map<string, { name: string; count: number }>();

    catalogItems.forEach((item) => {
      if (item.categoryId) {
        const categoryId = item.categoryId;
        const categoryName = item.category?.name || 'Sin categoría';
        const current = categoryMap.get(categoryId) || {
          name: categoryName,
          count: 0,
        };
        categoryMap.set(categoryId, {
          ...current,
          count: current.count + 1,
        });
      }
    });

    const treatmentsByCategory = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        count: data.count,
        percentage:
          totalTreatments > 0 ? (data.count / totalTreatments) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsedCategory =
      treatmentsByCategory.length > 0 ? treatmentsByCategory[0] : undefined;

    return {
      totalTreatments,
      activeTreatments,
      inactiveTreatments,
      treatmentsRequiringAnesthesia,
      treatmentsByCategory,
      mostUsedCategory,
      averagePrice: priceStats._avg.basePrice
        ? Number(priceStats._avg.basePrice)
        : 0,
      averageDuration: durationStats._avg.estimatedDuration
        ? Math.round(durationStats._avg.estimatedDuration)
        : 0,
    };
  }

  /**
   * Map catalog item to response DTO
   */
  private mapToResponse(catalog: any): TreatmentCatalogResponseDto {
    return {
      id: catalog.id,
      code: catalog.code,
      name: catalog.name,
      description: catalog.description,
      category: catalog.category
        ? {
            id: catalog.category.id,
            name: catalog.category.name,
          }
        : undefined,
      categoryId: catalog.categoryId,
      basePrice: Number(catalog.basePrice),
      estimatedDuration: catalog.estimatedDuration,
      requiresAnesthesia: catalog.requiresAnesthesia,
      isActive: catalog.isActive,
      createdAt: catalog.createdAt,
      updatedAt: catalog.updatedAt,
      stepCount: catalog._count?.TreatmentStep || 0,
    };
  }
}

