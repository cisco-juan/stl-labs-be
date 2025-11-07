import { ApiProperty } from '@nestjs/swagger';

class TreatmentByStatusDto {
  @ApiProperty({ description: 'Estado del tratamiento' })
  status: string;

  @ApiProperty({ description: 'Cantidad de tratamientos' })
  count: number;

  @ApiProperty({ description: 'Porcentaje del total' })
  percentage: number;
}

class TreatmentByDoctorDto {
  @ApiProperty({ description: 'ID del médico' })
  doctorId: string;

  @ApiProperty({ description: 'Nombre del médico' })
  doctorName: string;

  @ApiProperty({ description: 'Cantidad de tratamientos' })
  count: number;
}

export class TreatmentStatisticsResponseDto {
  @ApiProperty({
    description: 'Total de tratamientos',
    example: 150,
  })
  totalTreatments: number;

  @ApiProperty({
    description: 'Tratamientos por estado',
    type: [TreatmentByStatusDto],
  })
  treatmentsByStatus: TreatmentByStatusDto[];

  @ApiProperty({
    description: 'Tratamientos pagados',
    example: 100,
  })
  paidTreatments: number;

  @ApiProperty({
    description: 'Tratamientos pendientes de pago',
    example: 50,
  })
  unpaidTreatments: number;

  @ApiProperty({
    description: 'Ingresos totales',
    example: 1500000.0,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Ingresos promedio por tratamiento',
    example: 10000.0,
  })
  averageRevenue: number;

  @ApiProperty({
    description: 'Tratamientos completados',
    example: 80,
  })
  completedTreatments: number;

  @ApiProperty({
    description: 'Tratamientos en progreso',
    example: 50,
  })
  inProgressTreatments: number;

  @ApiProperty({
    description: 'Tratamientos cancelados',
    example: 20,
  })
  canceledTreatments: number;

  @ApiProperty({
    description: 'Tratamientos por médico',
    type: [TreatmentByDoctorDto],
  })
  treatmentsByDoctor: TreatmentByDoctorDto[];

  @ApiProperty({
    description: 'Promedio de pasos por tratamiento',
    example: 5.5,
  })
  averageStepsPerTreatment: number;
}

