import { ApiProperty } from '@nestjs/swagger';

class StatusCount {
  @ApiProperty({ description: 'Estado de la cita', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Cantidad de citas', example: 15 })
  count: number;

  @ApiProperty({ description: 'Porcentaje del total', example: 25.5 })
  percentage: number;
}

class PeriodComparison {
  @ApiProperty({ description: 'Total en el período actual', example: 120 })
  current: number;

  @ApiProperty({ description: 'Total en el período anterior', example: 100 })
  previous: number;

  @ApiProperty({ description: 'Cambio porcentual', example: 20 })
  changePercentage: number;

  @ApiProperty({ description: 'Tendencia (up/down/stable)', example: 'up' })
  trend: 'up' | 'down' | 'stable';
}

export class AppointmentStatisticsResponseDto {
  @ApiProperty({ description: 'Período de las estadísticas', example: 'month' })
  period: string;

  @ApiProperty({
    description: 'Fecha de inicio del período',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin del período',
    example: '2025-01-31T23:59:59.999Z',
  })
  endDate: Date;

  @ApiProperty({ description: 'Total de citas en el período', example: 150 })
  totalAppointments: number;

  @ApiProperty({
    description: 'Distribución de citas por estado',
    type: [StatusCount],
  })
  byStatus: StatusCount[];

  @ApiProperty({
    description: 'Comparación con período anterior',
    type: PeriodComparison,
  })
  comparison: PeriodComparison;

  @ApiProperty({
    description: 'Tasa de completación (completadas / total * 100)',
    example: 65.5,
  })
  completionRate: number;

  @ApiProperty({
    description: 'Tasa de cancelación (canceladas + expiradas / total * 100)',
    example: 15.5,
  })
  cancellationRate: number;

  @ApiProperty({
    description: 'Promedio de citas por día en el período',
    example: 5.2,
  })
  averagePerDay: number;
}
