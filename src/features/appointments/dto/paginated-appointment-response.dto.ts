import { ApiProperty } from '@nestjs/swagger';
import { AppointmentResponseDto } from './appointment-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class PaginatedAppointmentResponseDto {
  @ApiProperty({ type: [AppointmentResponseDto] })
  data: AppointmentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
