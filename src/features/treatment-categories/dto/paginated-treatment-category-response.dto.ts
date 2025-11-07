import { ApiProperty } from '@nestjs/swagger';
import { TreatmentCategoryResponseDto } from './treatment-category-response.dto';

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

export class PaginatedTreatmentCategoryResponseDto {
  @ApiProperty({
    description: 'Lista de categorías',
    type: [TreatmentCategoryResponseDto],
  })
  data: TreatmentCategoryResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
