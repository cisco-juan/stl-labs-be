import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { BranchStatus } from '@prisma/client';

export enum BranchSortBy {
  NAME = 'name',
  CODE = 'code',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  CITY = 'city',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class BranchQueryDto {
  @ApiPropertyOptional({
    example: 'Central',
    description: 'Buscar por nombre, código o ciudad',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: BranchStatus.ACTIVE,
    description: 'Filtrar por estado',
    enum: BranchStatus,
  })
  @IsEnum(BranchStatus)
  @IsOptional()
  status?: BranchStatus;

  @ApiPropertyOptional({
    example: 'Lima',
    description: 'Filtrar por ciudad',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: 'Perú',
    description: 'Filtrar por país',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: BranchSortBy.NAME,
    description: 'Campo por el cual ordenar',
    enum: BranchSortBy,
    default: BranchSortBy.CREATED_AT,
  })
  @IsEnum(BranchSortBy)
  @IsOptional()
  sortBy?: BranchSortBy = BranchSortBy.CREATED_AT;

  @ApiPropertyOptional({
    example: SortOrder.DESC,
    description: 'Orden ascendente o descendente',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de resultados por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
