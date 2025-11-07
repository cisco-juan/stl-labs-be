import { ApiProperty } from '@nestjs/swagger';

class CategoryInfoDto {
  @ApiProperty({ description: 'ID de la categoría' })
  id: string;

  @ApiProperty({ description: 'Nombre de la categoría' })
  name: string;
}

export class TreatmentCatalogResponseDto {
  @ApiProperty({
    description: 'ID del tratamiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Código único del tratamiento',
    example: 'ORT-001',
  })
  code: string;

  @ApiProperty({
    description: 'Nombre del tratamiento',
    example: 'Brackets Metálicos',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del tratamiento',
    example: 'Instalación de brackets metálicos para corrección dental',
  })
  description?: string;

  @ApiProperty({
    description: 'Información de la categoría',
    type: CategoryInfoDto,
    required: false,
  })
  category?: CategoryInfoDto;

  @ApiProperty({
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  categoryId?: string;

  @ApiProperty({
    description: 'Precio base del tratamiento',
    example: 5000.0,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Duración estimada en minutos',
    example: 120,
  })
  estimatedDuration: number;

  @ApiProperty({
    description: 'Requiere anestesia',
    example: false,
  })
  requiresAnesthesia: boolean;

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
    description: 'Cantidad de pasos de tratamiento que usan este catálogo',
    example: 5,
    required: false,
  })
  stepCount?: number;
}

