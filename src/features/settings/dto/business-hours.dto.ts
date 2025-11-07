import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import {
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class BusinessHoursDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del horario',
  })
  id: string;

  @ApiProperty({
    example: 'MONDAY',
    description: 'Día de la semana',
    enum: DayOfWeek,
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    example: true,
    description: 'Indica si está abierto este día',
  })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({
    example: '08:00',
    description: 'Hora de apertura en formato HH:mm',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:mm',
  })
  openTime?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'Hora de cierre en formato HH:mm',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:mm',
  })
  closeTime?: string;
}
