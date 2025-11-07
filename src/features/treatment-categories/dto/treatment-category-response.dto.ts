import { ApiProperty } from '@nestjs/swagger';

export class TreatmentCategoryResponseDto {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Ortodoncia',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Tratamientos relacionados con la corrección de la posición de los dientes',
  })
  description?: string;

  @ApiProperty({
    description: 'Estado activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Cantidad de tratamientos en esta categoría',
    example: 15,
    required: false,
  })
  treatmentCount?: number;
}
