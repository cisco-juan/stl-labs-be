import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStepResponseDto } from './treatment-step-response.dto';

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

export class PaginatedTreatmentStepResponseDto {
  @ApiProperty({
    description: 'Lista de pasos de tratamiento',
    type: [TreatmentStepResponseDto],
  })
  data: TreatmentStepResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

