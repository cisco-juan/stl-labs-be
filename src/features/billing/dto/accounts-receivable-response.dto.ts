import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReceivablePriority } from './accounts-receivable-query.dto';

export class InvoiceSummaryDto {
  @ApiProperty({ example: 'FAC-2025-00237' })
  code: string;

  @ApiProperty({ example: '2025-09-14T10:30:00.000Z' })
  date: Date;

  @ApiProperty({ example: 1100.0 })
  totalDebt: number;
}

export class AccountsReceivableResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId: string;

  @ApiProperty({ example: 'Luis Fernández' })
  patientName: string;

  @ApiPropertyOptional({ example: '809-555-0126' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'luis@email.com' })
  email?: string;

  @ApiProperty({ type: [InvoiceSummaryDto] })
  invoices: InvoiceSummaryDto[];

  @ApiProperty({ example: 36 })
  daysOverdue: number;

  @ApiProperty({ example: 1100.0 })
  totalDebt: number;

  @ApiProperty({ enum: ReceivablePriority, example: ReceivablePriority.HIGH })
  priority: ReceivablePriority;
}

