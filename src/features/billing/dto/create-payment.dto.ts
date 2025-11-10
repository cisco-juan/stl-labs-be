import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la factura',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({
    description: 'Monto del pago',
    example: 50.0,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Fecha de pago',
    example: '2025-10-19T10:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional({
    description: 'Referencia del pago (número de tarjeta, transferencia, etc.)',
    example: 'TRF-789456',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Pago en efectivo',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

