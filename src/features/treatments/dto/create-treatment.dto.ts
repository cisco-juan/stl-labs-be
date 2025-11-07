import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TreatmentStatus, PaymentMethod } from '@prisma/client';

export class CreateTreatmentDto {
  @ApiProperty({
    description: 'Nombre del tratamiento',
    example: 'Tratamiento de Ortodoncia Completo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tratamiento',
    example: 'Tratamiento completo de ortodoncia con brackets metálicos',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Código del tratamiento',
    example: 'TRT-001',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({
    description: 'ID del médico responsable',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Diagnóstico',
    example: 'Maloclusión clase II',
  })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({
    description: 'Pronóstico',
    example: 'Favorable con tratamiento adecuado',
  })
  @IsString()
  @IsOptional()
  prognosis?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin estimada',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de validez',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  validityDate?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Paciente requiere seguimiento mensual',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Estado del tratamiento',
    enum: TreatmentStatus,
    default: TreatmentStatus.PENDING,
  })
  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Precio total del tratamiento',
    example: 10000.0,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado',
    example: 500.0,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({
    description: 'Porcentaje de descuento',
    example: 5.0,
    default: 0,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;
}

