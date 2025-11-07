import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único de la moneda',
  })
  id: string;

  @ApiProperty({
    example: 'USD',
    description: 'Código de la moneda',
  })
  code: string;

  @ApiProperty({
    example: 'US Dollar',
    description: 'Nombre de la moneda',
  })
  name: string;

  @ApiProperty({
    example: '$',
    description: 'Símbolo de la moneda',
  })
  symbol: string;

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
