import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    description: 'ID del paciente',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'ID del tratamiento asociado',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @ApiPropertyOptional({
    description: 'ID del paso de tratamiento asociado',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  treatmentStepId?: string;

  @ApiPropertyOptional({
    description: 'ID del médico',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'ID de la sucursal',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Items de la factura',
    type: [CreateInvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @IsOptional()
  items?: CreateInvoiceItemDto[];

  @ApiPropertyOptional({
    description: 'Descuento total aplicado',
    example: 0.0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento',
    example: '2025-11-19T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Moneda',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;
}

