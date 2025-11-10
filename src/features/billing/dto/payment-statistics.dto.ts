import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatisticsDto {
  @ApiProperty({ example: 10.0, description: 'Total de pagos' })
  totalPayments: number;

  @ApiProperty({ example: 1, description: 'Pagos realizados hoy' })
  paymentsToday: number;

  @ApiProperty({ example: 10.0, description: 'Total pagado en efectivo' })
  cashPayments: number;

  @ApiProperty({ example: 1, description: 'Total de transacciones' })
  totalTransactions: number;
}

