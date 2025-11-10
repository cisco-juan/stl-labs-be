import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReceivablePriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class AccountsReceivableQueryDto {
  @ApiPropertyOptional({
    example: 'María García',
    description: 'Búsqueda por nombre del paciente',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Filtro por días vencido mínimo',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  daysOverdueMin?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Filtro por días vencido máximo',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  daysOverdueMax?: number;

  @ApiPropertyOptional({
    enum: ReceivablePriority,
    example: ReceivablePriority.HIGH,
    description: 'Filtro por prioridad',
  })
  @IsString()
  @IsOptional()
  priority?: ReceivablePriority;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filtro por fecha de factura desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  invoiceDateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filtro por fecha de factura hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  invoiceDateTo?: string;

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

