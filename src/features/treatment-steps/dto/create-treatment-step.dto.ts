import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TreatmentStepStatus, PaymentMethod } from '@prisma/client';

export class CreateTreatmentStepDto {
  @ApiProperty({
    description: 'Nombre del paso',
    example: 'Instalación de brackets superiores',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID del tratamiento al que pertenece',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  treatmentId: string;

  @ApiPropertyOptional({
    description: 'ID del tratamiento del catálogo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  catalogTreatmentId?: string;

  @ApiPropertyOptional({
    description: 'Descripción del paso',
    example: 'Instalación de brackets metálicos en arcada superior',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado del paso',
    enum: TreatmentStepStatus,
    default: TreatmentStepStatus.PENDING,
  })
  @IsEnum(TreatmentStepStatus)
  @IsOptional()
  status?: TreatmentStepStatus;

  @ApiPropertyOptional({
    description: 'Cantidad',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Precio del paso',
    example: 2000.0,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'ID del médico responsable',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Descuento aplicado',
    example: 100.0,
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

  @ApiPropertyOptional({
    description: 'Orden del paso dentro del tratamiento',
    example: 1,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Número de diente',
    example: '16',
  })
  @IsString()
  @IsOptional()
  toothNumber?: string;

  @ApiPropertyOptional({
    description: 'Unidades',
    example: ['pieza', 'superficie'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  units?: string[];

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Paciente requiere anestesia local',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

