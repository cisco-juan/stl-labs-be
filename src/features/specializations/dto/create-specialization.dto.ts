import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateSpecializationDto {
  @ApiProperty({
    example: 'Odontología General',
    description: 'Nombre de la especialización',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Especialización en tratamientos dentales generales',
    description: 'Descripción de la especialización',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
