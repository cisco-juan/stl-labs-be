import { IsOptional, IsString, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TreatmentCatalogQueryDto {
  @ApiProperty({
    description: 'Número de página',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  page?: string = "1";

  @ApiProperty({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  limit?: string = "10";

  @ApiProperty({
    description: 'Búsqueda por nombre o código',
    required: false,
    example: 'brackets',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
    example: true,
  })
  @IsOptional()
  isActive?: string = "true";

  @ApiProperty({
    description: 'Filtrar por categoría',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Filtrar por tratamientos que requieren anestesia',
    required: false,
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  requiresAnesthesia?: boolean;
}

