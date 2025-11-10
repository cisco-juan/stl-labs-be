import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiPropertyOptional({ example: 'REC-2025-00189' })
  code?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  invoiceId?: string;

  @ApiPropertyOptional({ example: 'FAC-2025-00234' })
  invoiceCode?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId?: string;

  @ApiPropertyOptional({ example: 'María García' })
  patientName?: string;

  @ApiProperty({ example: 50.0 })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: '2025-10-19T10:30:00.000Z' })
  paymentDate?: Date;

  @ApiPropertyOptional({ example: 'Pago en efectivo' })
  notes?: string;

  @ApiPropertyOptional({ example: 'TRF-789456' })
  reference?: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  status: PaymentStatus;

  @ApiProperty({ example: '2025-10-19T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-19T10:30:00.000Z' })
  updatedAt: Date;
}

