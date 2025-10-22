import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStatus } from '@prisma/client';

export class BranchResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único de la sucursal',
  })
  id: string;

  @ApiProperty({
    example: 'Sucursal Central',
    description: 'Nombre de la sucursal',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'SUC-001',
    description: 'Código único de la sucursal',
  })
  code?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal 123',
    description: 'Dirección de la sucursal',
  })
  address?: string;

  @ApiPropertyOptional({
    example: '+51 999 999 999',
    description: 'Número de teléfono',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'central@stl.com',
    description: 'Email de contacto',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'Lima',
    description: 'Ciudad',
  })
  city?: string;

  @ApiPropertyOptional({
    example: 'Perú',
    description: 'País',
  })
  country?: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Estado de la sucursal',
    enum: BranchStatus,
  })
  status: BranchStatus;

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
