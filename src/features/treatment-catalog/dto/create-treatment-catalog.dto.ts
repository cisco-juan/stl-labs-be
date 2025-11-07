import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateTreatmentCatalogDto {
  @ApiProperty({
    description: 'Código único del tratamiento',
    example: 'ORT-001',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Nombre del tratamiento',
    example: 'Brackets Metálicos',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción del tratamiento',
    example: 'Instalación de brackets metálicos para corrección dental',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID de la categoría del tratamiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Precio base del tratamiento',
    example: 5000.0,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiProperty({
    description: 'Duración estimada en minutos',
    example: 120,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @ApiProperty({
    description: 'Requiere anestesia',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresAnesthesia?: boolean;

  @ApiProperty({
    description: 'Estado activo del tratamiento',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

