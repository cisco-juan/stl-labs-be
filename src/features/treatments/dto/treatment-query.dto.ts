import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStatus } from '@prisma/client';

export class TreatmentQueryDto {
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
    description: 'Búsqueda por nombre, código o diagnóstico',
    required: false,
    example: 'ortodoncia',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por paciente',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    description: 'Filtrar por médico',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    description: 'Filtrar por sucursal',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({
    description: 'Filtrar por estado',
    enum: TreatmentStatus,
    required: false,
  })
  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;

  @ApiProperty({
    description: 'Filtrar por estado de pago',
    required: false,
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({
    description: 'Filtrar por fecha de inicio desde',
    required: false,
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @ApiProperty({
    description: 'Filtrar por fecha de inicio hasta',
    required: false,
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  startDateTo?: string;
}

