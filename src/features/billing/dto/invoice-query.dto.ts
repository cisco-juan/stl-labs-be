import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceQueryDto {
  @ApiPropertyOptional({
    example: 'FAC-2025-00234',
    description: 'Búsqueda por código de factura o nombre del paciente',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
    description: 'Filtro por estado de la factura',
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por paciente',
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por sucursal',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filtro por fecha de creación desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filtro por fecha de creación hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  createdTo?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filtro por fecha de vencimiento desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  expiresFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filtro por fecha de vencimiento hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  expiresTo?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Campo por el cual ordenar',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: '1',
    description: 'Número de página',
    default: '1',
    minimum: 1,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'Cantidad de resultados por página',
    default: '10',
    minimum: 1,
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

