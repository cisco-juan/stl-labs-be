import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentPlanDto {
  @ApiProperty({
    description: 'ID del tratamiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  treatmentId: string;

  @ApiProperty({
    description: 'Número de cuotas',
    example: 6,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  numberOfInstallments: number;

  @ApiProperty({
    description: 'Monto de cada cuota',
    example: 1500.0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  installmentAmount: number;

  @ApiPropertyOptional({
    description: 'Pago inicial',
    example: 1000.0,
    default: 0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  initialPayment?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del plan',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}

