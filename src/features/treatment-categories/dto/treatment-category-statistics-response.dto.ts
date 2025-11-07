import { ApiProperty } from '@nestjs/swagger';

class CategoryCount {
  @ApiProperty({ description: 'ID de la categoría', example: '123e4567...' })
  categoryId: string;

  @ApiProperty({ description: 'Nombre de la categoría', example: 'Ortodoncia' })
  categoryName: string;

  @ApiProperty({ description: 'Cantidad de tratamientos', example: 25 })
  count: number;

  @ApiProperty({ description: 'Porcentaje del total', example: 35.5 })
  percentage: number;
}

export class TreatmentCategoryStatisticsResponseDto {
  @ApiProperty({
    description: 'Total de categorías',
    example: 10,
  })
  totalCategories: number;

  @ApiProperty({
    description: 'Categorías activas',
    example: 8,
  })
  activeCategories: number;

  @ApiProperty({
    description: 'Categorías inactivas',
    example: 2,
  })
  inactiveCategories: number;

  @ApiProperty({
    description: 'Total de tratamientos en el catálogo',
    example: 75,
  })
  totalTreatments: number;

  @ApiProperty({
    description: 'Distribución de tratamientos por categoría',
    type: [CategoryCount],
  })
  treatmentsByCategory: CategoryCount[];

  @ApiProperty({
    description: 'Categoría más utilizada',
    type: CategoryCount,
    required: false,
  })
  mostUsedCategory?: CategoryCount;
}
