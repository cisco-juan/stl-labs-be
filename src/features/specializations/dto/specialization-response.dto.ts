import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpecializationResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único de la especialización',
  })
  id: string;

  @ApiProperty({
    example: 'Odontología General',
    description: 'Nombre de la especialización',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Especialización en tratamientos dentales generales',
    description: 'Descripción de la especialización',
  })
  description?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}

export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Límite por página' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total de páginas' })
  totalPages: number;
}

export class PaginatedSpecializationResponseDto {
  @ApiProperty({
    type: [SpecializationResponseDto],
    description: 'Lista de especializaciones',
  })
  data: SpecializationResponseDto[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Metadatos de paginación',
  })
  meta: PaginationMeta;
}
