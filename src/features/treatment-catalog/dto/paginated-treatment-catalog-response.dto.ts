import { ApiProperty } from '@nestjs/swagger';
import { TreatmentCatalogResponseDto } from './treatment-catalog-response.dto';

class PaginationMetaDto {
  @ApiProperty({ description: 'Total de registros', example: 100 })
  total: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number;
}

export class PaginatedTreatmentCatalogResponseDto {
  @ApiProperty({
    description: 'Lista de tratamientos del catálogo',
    type: [TreatmentCatalogResponseDto],
  })
  data: TreatmentCatalogResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

