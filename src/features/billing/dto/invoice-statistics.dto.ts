import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatisticsDto {
  @ApiProperty({ example: 110.0, description: 'Total facturado' })
  totalInvoiced: number;

  @ApiProperty({ example: 2, description: 'Número de facturas' })
  totalInvoices: number;

  @ApiProperty({ example: 10.0, description: 'Total cobrado' })
  totalCollected: number;

  @ApiProperty({ example: 9.09, description: 'Porcentaje del total cobrado' })
  collectedPercentage: number;

  @ApiProperty({ example: 100.0, description: 'Total por cobrar' })
  totalToCollect: number;

  @ApiProperty({ example: 1, description: 'Número de facturas pendientes' })
  pendingInvoices: number;

  @ApiProperty({ example: 0, description: 'Número de facturas vencidas' })
  overdueInvoices: number;
}

