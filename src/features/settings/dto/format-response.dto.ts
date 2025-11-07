import { ApiProperty } from '@nestjs/swagger';

export class DateFormatResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único del formato de fecha',
  })
  id: string;

  @ApiProperty({
    example: 'DD/MM/YYYY',
    description: 'Código del formato de fecha',
  })
  code: string;

  @ApiProperty({
    example: 'DD/MM/YYYY',
    description: 'Formato de fecha',
  })
  format: string;

  @ApiProperty({
    example: '31/12/2024',
    description: 'Ejemplo del formato de fecha',
  })
  example: string;

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

export class TimeFormatResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único del formato de hora',
  })
  id: string;

  @ApiProperty({
    example: '24H',
    description: 'Código del formato de hora',
  })
  code: string;

  @ApiProperty({
    example: 'HH:mm',
    description: 'Formato de hora',
  })
  format: string;

  @ApiProperty({
    example: '23:59',
    description: 'Ejemplo del formato de hora',
  })
  example: string;

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
