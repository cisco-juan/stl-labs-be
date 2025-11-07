import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientStatsDto {
  @ApiProperty({ example: 34, description: 'Edad del paciente en años' })
  age: number;

  @ApiProperty({ example: 15, description: 'Total de visitas/citas del paciente' })
  totalVisits: number;

  @ApiPropertyOptional({
    example: '2024-12-01T10:30:00.000Z',
    description: 'Fecha de la última visita',
  })
  lastVisit?: Date;

  @ApiProperty({ example: 1250.5, description: 'Balance pendiente de pago' })
  pendingBalance: number;
}
