import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoryQueryDto,
  TreatmentCategoryResponseDto,
  PaginatedTreatmentCategoryResponseDto,
  TreatmentCategoryStatisticsResponseDto,
} from './dto';

@Injectable()
export class TreatmentCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new treatment category
   */
  async create(
    createDto: CreateTreatmentCategoryDto,
  ): Promise<TreatmentCategoryResponseDto> {
    const category = await this.prisma.treatmentCategory.create({
      data: createDto,
      include: {
        _count: {
          select: { TreatmentCatalog: true },
        },
      },
    });

    return this.mapToResponse(category);
  }

  /**
   * Find all treatment categories with pagination and filters
   */
  async findAll(
    query: TreatmentCategoryQueryDto,
  ): Promise<PaginatedTreatmentCategoryResponseDto> {
    const { page = "1", limit = "10", search, isActive } = query;
    const skip = (+(page || 1) - 1) * +(limit || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [categories, total] = await Promise.all([
      this.prisma.treatmentCategory.findMany({
        where,
        skip,
        take: +(limit || 10),
        include: {
          _count: {
            select: { TreatmentCatalog: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.treatmentCategory.count({ where }),
    ]);

    return {
      data: categories.map((category) => this.mapToResponse(category)),
      meta: {
        total,
        page: +(page || 1),
        limit: +(limit || 10),
        totalPages: Math.ceil(total / +(limit || 10)) || 1
      },
    };
  }

  /**
   * Find a single treatment category by ID
   */
  async findOne(id: string): Promise<TreatmentCategoryResponseDto> {
    const category = await this.prisma.treatmentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { TreatmentCatalog: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría de tratamiento no encontrada');
    }

    return this.mapToResponse(category);
  }

  /**
   * Update a treatment category
   */
  async update(
    id: string,
    updateDto: UpdateTreatmentCategoryDto,
  ): Promise<TreatmentCategoryResponseDto> {
    // Check if category exists
    await this.findOne(id);

    const category = await this.prisma.treatmentCategory.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: { TreatmentCatalog: true },
        },
      },
    });

    return this.mapToResponse(category);
  }

  /**
   * Delete a treatment category
   */
  async remove(id: string): Promise<void> {
    // Check if category exists
    await this.findOne(id);

    await this.prisma.treatmentCategory.delete({
      where: { id },
    });
  }

  /**
   * Get statistics for treatment categories
   */
  async getStatistics(): Promise<TreatmentCategoryStatisticsResponseDto> {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithCounts,
    ] = await Promise.all([
      this.prisma.treatmentCategory.count(),
      this.prisma.treatmentCategory.count({ where: { isActive: true } }),
      this.prisma.treatmentCategory.count({ where: { isActive: false } }),
      this.prisma.treatmentCategory.findMany({
        include: {
          _count: {
            select: { TreatmentCatalog: true },
          },
        },
      }),
    ]);

    const totalTreatments = categoriesWithCounts.reduce(
      (sum, cat) => sum + cat._count.TreatmentCatalog,
      0,
    );

    const treatmentsByCategory = categoriesWithCounts
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        count: cat._count.TreatmentCatalog,
        percentage:
          totalTreatments > 0
            ? (cat._count.TreatmentCatalog / totalTreatments) * 100
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsedCategory = treatmentsByCategory[0] || undefined;

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalTreatments,
      treatmentsByCategory,
      mostUsedCategory,
    };
  }

  /**
   * Map category to response DTO
   */
  private mapToResponse(category: any): TreatmentCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      treatmentCount: category._count?.TreatmentCatalog || 0,
    };
  }
}
