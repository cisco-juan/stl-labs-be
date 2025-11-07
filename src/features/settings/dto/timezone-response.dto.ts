import { ApiProperty } from '@nestjs/swagger';

export class TimezoneResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único de la zona horaria',
  })
  id: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'Código IANA de la zona horaria',
  })
  code: string;

  @ApiProperty({
    example: 'Eastern Time (US & Canada)',
    description: 'Nombre descriptivo de la zona horaria',
  })
  name: string;

  @ApiProperty({
    example: -5,
    description: 'Offset en horas respecto a UTC',
  })
  offsetHours: number;

  @ApiProperty({
    example: 0,
    description: 'Offset en minutos respecto a UTC',
  })
  offsetMinutes: number;

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
