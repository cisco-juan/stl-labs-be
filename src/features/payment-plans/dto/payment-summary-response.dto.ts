import { ApiProperty } from '@nestjs/swagger';

export class PaymentSummaryResponseDto {
  @ApiProperty({
    description: 'Total de cuotas',
    example: 6,
  })
  totalInstallments: number;

  @ApiProperty({
    description: 'Cuotas pagadas',
    example: 2,
  })
  paidInstallments: number;

  @ApiProperty({
    description: 'Cuotas pendientes',
    example: 4,
  })
  pendingInstallments: number;

  @ApiProperty({
    description: 'Monto total del plan',
    example: 10000.0,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Monto pagado',
    example: 4000.0,
  })
  paidAmount: number;

  @ApiProperty({
    description: 'Monto pendiente',
    example: 6000.0,
  })
  pendingAmount: number;

  @ApiProperty({
    description: 'Porcentaje pagado',
    example: 40.0,
  })
  paidPercentage: number;
}

