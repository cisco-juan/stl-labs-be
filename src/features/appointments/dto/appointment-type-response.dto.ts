import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentTypeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'Consulta' })
  name: string;

  @ApiPropertyOptional({ example: 'Consulta general' })
  description?: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
