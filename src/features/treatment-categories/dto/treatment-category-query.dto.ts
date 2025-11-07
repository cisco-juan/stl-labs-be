import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TreatmentCategoryQueryDto {
  @ApiProperty({
    description: 'Número de página',
    example: 1,
    default: 1,
    required: false,
  })  
  @IsOptional()
  page?: string = "1";

  @ApiProperty({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  limit?: string = "10";

  @ApiProperty({
    description: 'Búsqueda por nombre',
    required: false,
    example: 'ortodoncia',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
    example: true,
  })
  @IsOptional()
  isActive?: string = "true";
}
