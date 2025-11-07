import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DentalPieceStatus, DentalSurfaceType } from '@prisma/client';

export class DentalSurfaceDto {
  @ApiProperty({
    enum: DentalSurfaceType,
    example: DentalSurfaceType.OCLUSAL,
    description: 'Tipo de superficie dental',
  })
  @IsEnum(DentalSurfaceType, { message: 'El tipo de superficie debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de superficie es requerido' })
  surfaceType: DentalSurfaceType;

  @ApiProperty({
    example: true,
    description: 'Indica si la superficie tiene alguna condición',
  })
  @IsBoolean({ message: 'hasCondition debe ser verdadero o falso' })
  hasCondition: boolean;

  @ApiPropertyOptional({
    example: 'Caries superficial',
    description: 'Descripción de la condición en la superficie',
  })
  @IsString({ message: 'La condición debe ser un texto' })
  @IsOptional()
  condition?: string;
}

export class DentalPieceDto {
  @ApiProperty({
    example: '11',
    description: 'Número de pieza dental en notación FDI (11-48 adulto, 51-85 deciduo)',
  })
  @IsString({ message: 'El número de pieza debe ser un texto' })
  @IsNotEmpty({ message: 'El número de pieza es requerido' })
  pieceNumber: string;

  @ApiProperty({
    enum: DentalPieceStatus,
    example: DentalPieceStatus.SANO,
    description: 'Estado de la pieza dental',
  })
  @IsEnum(DentalPieceStatus, { message: 'El estado de la pieza debe ser válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: DentalPieceStatus;

  @ApiPropertyOptional({
    example: 'Obturación reciente',
    description: 'Notas sobre la pieza dental',
  })
  @IsString({ message: 'Las notas deben ser un texto' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    type: [DentalSurfaceDto],
    description: 'Superficies de la pieza dental',
  })
  @IsArray({ message: 'Las superficies deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => DentalSurfaceDto)
  @IsOptional()
  surfaces?: DentalSurfaceDto[];
}

export class UpdateOdontogramDto {
  @ApiPropertyOptional({
    example: 'Odontograma actualizado en revisión anual',
    description: 'Observaciones generales del odontograma',
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observations?: string;

  @ApiProperty({
    type: [DentalPieceDto],
    description: 'Piezas dentales a actualizar',
  })
  @IsArray({ message: 'Las piezas dentales deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => DentalPieceDto)
  @IsNotEmpty({ message: 'Debe proporcionar al menos una pieza dental' })
  dentalPieces: DentalPieceDto[];
}

export class DentalSurfaceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ enum: DentalSurfaceType, example: DentalSurfaceType.OCLUSAL })
  surfaceType: DentalSurfaceType;

  @ApiProperty({ example: true })
  hasCondition: boolean;

  @ApiPropertyOptional({ example: 'Caries superficial' })
  condition?: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class DentalPieceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: '11' })
  pieceNumber: string;

  @ApiProperty({ enum: DentalPieceStatus, example: DentalPieceStatus.SANO })
  status: DentalPieceStatus;

  @ApiPropertyOptional({ example: 'Obturación reciente' })
  notes?: string | null;

  @ApiProperty({ type: [DentalSurfaceResponseDto] })
  surfaces: DentalSurfaceResponseDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class OdontogramResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId: string;

  @ApiPropertyOptional({ example: 'Odontograma actualizado' })
  observations?: string | null;

  @ApiProperty({ type: [DentalPieceResponseDto] })
  dentalPieces: DentalPieceResponseDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
