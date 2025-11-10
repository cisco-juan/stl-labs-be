import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

export class InvoiceItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'Consulta dental' })
  name: string;

  @ApiProperty({ example: 50.0 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 0.0 })
  discount: number;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiPropertyOptional({ example: 'FAC-2025-00234' })
  code?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId?: string;

  @ApiPropertyOptional({ example: 'María García' })
  patientName?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  doctorId?: string;

  @ApiPropertyOptional({ example: 'Dr. Roberto Martínez' })
  doctorName?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  branchId?: string;

  @ApiPropertyOptional({ example: 'Sucursal Centro' })
  branchName?: string;

  @ApiProperty({ example: 500.0 })
  totalAmount: number;

  @ApiProperty({ example: 0.0 })
  discount: number;

  @ApiProperty({ example: 250.0 })
  paidAmount: number;

  @ApiProperty({ example: 250.0 })
  balance: number;

  @ApiProperty({ example: false })
  isPaid: boolean;

  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @ApiProperty({ example: '2025-10-19T10:30:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2025-11-19T10:30:00.000Z' })
  expiresAt?: Date;

  @ApiPropertyOptional({ example: '2025-10-19T10:30:00.000Z' })
  paidAt?: Date;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ type: [InvoiceItemResponseDto] })
  items?: InvoiceItemResponseDto[];
}

