import { ApiProperty } from '@nestjs/swagger';

class TreatmentByCategoryDto {
  @ApiProperty({ description: 'ID de la categoría' })
  categoryId: string;

  @ApiProperty({ description: 'Nombre de la categoría' })
  categoryName: string;

  @ApiProperty({ description: 'Cantidad de tratamientos' })
  count: number;

  @ApiProperty({ description: 'Porcentaje del total' })
  percentage: number;
}

export class TreatmentCatalogStatisticsResponseDto {
  @ApiProperty({
    description: 'Total de tratamientos en el catálogo',
    example: 50,
  })
  totalTreatments: number;

  @ApiProperty({
    description: 'Tratamientos activos',
    example: 45,
  })
  activeTreatments: number;

  @ApiProperty({
    description: 'Tratamientos inactivos',
    example: 5,
  })
  inactiveTreatments: number;

  @ApiProperty({
    description: 'Tratamientos que requieren anestesia',
    example: 20,
  })
  treatmentsRequiringAnesthesia: number;

  @ApiProperty({
    description: 'Tratamientos por categoría',
    type: [TreatmentByCategoryDto],
  })
  treatmentsByCategory: TreatmentByCategoryDto[];

  @ApiProperty({
    description: 'Categoría más utilizada',
    type: TreatmentByCategoryDto,
    required: false,
  })
  mostUsedCategory?: TreatmentByCategoryDto;

  @ApiProperty({
    description: 'Precio promedio de tratamientos',
    example: 3500.0,
  })
  averagePrice: number;

  @ApiProperty({
    description: 'Duración promedio en minutos',
    example: 90,
  })
  averageDuration: number;
}

