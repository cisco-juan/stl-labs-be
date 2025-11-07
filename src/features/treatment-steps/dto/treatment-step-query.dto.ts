import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStepStatus } from '@prisma/client';

export class TreatmentStepQueryDto {
  @ApiProperty({
    description: 'Número de página',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Filtrar por tratamiento',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  treatmentId: string;

  @ApiProperty({
    description: 'Filtrar por estado',
    enum: TreatmentStepStatus,
    required: false,
  })
  @IsEnum(TreatmentStepStatus)
  @IsOptional()
  status?: TreatmentStepStatus;

  @ApiProperty({
    description: 'Filtrar por médico',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    description: 'Filtrar por estado de pago',
    required: false,
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

