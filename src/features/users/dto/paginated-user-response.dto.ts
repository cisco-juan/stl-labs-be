import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class PaginationMeta {
  @ApiProperty({ example: 100, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Resultados por página' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total de páginas' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Tiene página siguiente' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'Tiene página anterior' })
  hasPreviousPage: boolean;
}

export class PaginatedUserResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Lista de usuarios',
  })
  data: UserResponseDto[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Metadatos de paginación',
  })
  meta: PaginationMeta;
}
