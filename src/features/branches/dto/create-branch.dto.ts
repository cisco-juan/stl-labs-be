import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { BranchStatus } from '@prisma/client';

export class CreateBranchDto {
  @ApiProperty({
    example: 'Sucursal Central',
    description: 'Nombre de la sucursal',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'SUC-001',
    description: 'Código único de la sucursal',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal 123',
    description: 'Dirección de la sucursal',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: '+51 999 999 999',
    description: 'Número de teléfono',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'central@stl.com',
    description: 'Email de contacto de la sucursal',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Lima',
    description: 'Ciudad donde se ubica la sucursal',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: 'Perú',
    description: 'País donde se ubica la sucursal',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Estado de la sucursal',
    enum: BranchStatus,
    default: BranchStatus.ACTIVE,
  })
  @IsEnum(BranchStatus, { message: 'Estado inválido' })
  @IsOptional()
  status?: BranchStatus;
}
