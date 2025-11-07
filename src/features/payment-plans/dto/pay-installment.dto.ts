import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class PayInstallmentDto {
  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Fecha de pago',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;
}

