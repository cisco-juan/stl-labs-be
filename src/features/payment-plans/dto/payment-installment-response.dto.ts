import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class PaymentInstallmentResponseDto {
  @ApiProperty({
    description: 'ID de la cuota',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Número de cuota',
    example: 1,
  })
  installmentNumber: number;

  @ApiProperty({
    description: 'Monto de la cuota',
    example: 1500.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Fecha de vencimiento',
  })
  dueDate: Date;

  @ApiPropertyOptional({
    description: 'Fecha de pago',
  })
  paidDate?: Date;

  @ApiProperty({
    description: 'Indica si está pagada',
    example: false,
  })
  isPaid: boolean;

  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: PaymentMethod,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}

