import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @ApiProperty({
    description: 'Nombre del item',
    example: 'Consulta dental',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Precio unitario',
    example: 50.0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Cantidad',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado',
    example: 0.0,
    default: 0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({
    description: 'ID del inventario asociado (opcional)',
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
  })
  @IsUUID()
  @IsOptional()
  inventoryId?: string;
}

