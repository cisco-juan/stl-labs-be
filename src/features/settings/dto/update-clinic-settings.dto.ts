import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateClinicSettingsDto {
  @ApiPropertyOptional({
    example: 'STL Laboratory',
    description: 'Nombre de la clínica',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'STL Medical Laboratory Inc.',
    description: 'Razón social o nombre legal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({
    example: '123-45-6789',
    description: 'RNC, cédula jurídica o Tax ID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 123-4567',
    description: 'Teléfono principal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mainPhone?: string;

  @ApiPropertyOptional({
    example: 'contact@stl-lab.com',
    description: 'Email de contacto',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://www.stl-lab.com',
    description: 'Sitio web',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: '123 Medical Center Drive, Suite 100',
    description: 'Dirección física de la clínica',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'SPANISH',
    description: 'Idioma por defecto del sistema',
    enum: Language,
  })
  @IsOptional()
  @IsEnum(Language)
  defaultLanguage?: Language;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la zona horaria por defecto',
  })
  @IsOptional()
  @IsUUID()
  defaultTimezoneId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la moneda por defecto',
  })
  @IsOptional()
  @IsUUID()
  defaultCurrencyId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del formato de fecha',
  })
  @IsOptional()
  @IsUUID()
  dateFormatId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del formato de hora',
  })
  @IsOptional()
  @IsUUID()
  timeFormatId?: string;
}
