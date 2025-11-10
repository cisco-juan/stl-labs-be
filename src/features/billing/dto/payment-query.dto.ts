import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentQueryDto {
  @ApiPropertyOptional({
    example: 'REC-2025-00189',
    description: 'Búsqueda por código de recibo, código de factura o nombre del paciente',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: 'Filtro por método de pago',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Filtro por estado del pago',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por paciente',
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por factura',
  })
  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filtro por fecha de pago desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  paymentDateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filtro por fecha de pago hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  paymentDateTo?: string;

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

