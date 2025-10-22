import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export enum UserSortBy {
  FULL_NAME = 'fullName',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ROLE = 'role',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Buscar por nombre, email o DNI',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: UserRole.DOCTOR,
    description: 'Filtrar por rol',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    description: 'Filtrar por estado',
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filtrar por ID de especialización',
  })
  @IsUUID('4', { message: 'El ID de especialización debe ser un UUID válido' })
  @IsOptional()
  specializationId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filtrar por ID de sucursal (usuarios asignados a esa sucursal)',
  })
  @IsUUID('4', { message: 'El ID de sucursal debe ser un UUID válido' })
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    example: UserSortBy.FULL_NAME,
    description: 'Campo por el cual ordenar',
    enum: UserSortBy,
    default: UserSortBy.CREATED_AT,
  })
  @IsEnum(UserSortBy)
  @IsOptional()
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;

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
