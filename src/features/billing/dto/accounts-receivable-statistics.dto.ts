import { ApiProperty } from '@nestjs/swagger';

export class AgingAnalysisDto {
  @ApiProperty({ example: 0.0, description: 'Saldo de 0-15 días' })
  days0to15: number;

  @ApiProperty({ example: 0.0, description: 'Saldo de 16-30 días' })
  days16to30: number;

  @ApiProperty({ example: 0.0, description: 'Saldo de 31-60 días' })
  days31to60: number;

  @ApiProperty({ example: 0.0, description: 'Saldo de más de 60 días' })
  daysOver60: number;
}

export class AccountsReceivableStatisticsDto {
  @ApiProperty({ example: 0.0, description: 'Total por cobrar' })
  totalToCollect: number;

  @ApiProperty({ example: 0, description: 'Número de cuentas por cobrar' })
  totalAccounts: number;

  @ApiProperty({ example: 0, description: 'Número de cuentas vencidas' })
  overdueAccounts: number;

  @ApiProperty({ example: 0, description: 'Número de cuentas con prioridad alta' })
  highPriorityAccounts: number;

  @ApiProperty({ example: 0.0, description: 'Promedio de deuda por cliente' })
  averageDebtPerClient: number;

  @ApiProperty({ type: AgingAnalysisDto, description: 'Análisis de antigüedad de saldos' })
  agingAnalysis: AgingAnalysisDto;
}

