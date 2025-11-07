import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { BusinessHoursDto } from './business-hours.dto';
import { CurrencyResponseDto } from './currency-response.dto';
import { TimezoneResponseDto } from './timezone-response.dto';
import { DateFormatResponseDto, TimeFormatResponseDto } from './format-response.dto';

export class ClinicSettingsResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la configuración',
  })
  id: string;

  @ApiProperty({
    example: 'STL Laboratory',
    description: 'Nombre de la clínica',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'STL Medical Laboratory Inc.',
    description: 'Razón social o nombre legal',
  })
  legalName?: string;

  @ApiPropertyOptional({
    example: '123-45-6789',
    description: 'RNC, cédula jurídica o Tax ID',
  })
  taxId?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 123-4567',
    description: 'Teléfono principal',
  })
  mainPhone?: string;

  @ApiPropertyOptional({
    example: 'contact@stl-lab.com',
    description: 'Email de contacto',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://www.stl-lab.com',
    description: 'Sitio web',
  })
  website?: string;

  @ApiPropertyOptional({
    example: '123 Medical Center Drive, Suite 100',
    description: 'Dirección física de la clínica',
  })
  address?: string;

  @ApiProperty({
    example: 'SPANISH',
    description: 'Idioma por defecto del sistema',
    enum: Language,
  })
  defaultLanguage: Language;

  @ApiPropertyOptional({
    type: TimezoneResponseDto,
    description: 'Zona horaria por defecto',
  })
  defaultTimezone?: TimezoneResponseDto;

  @ApiPropertyOptional({
    type: CurrencyResponseDto,
    description: 'Moneda por defecto',
  })
  defaultCurrency?: CurrencyResponseDto;

  @ApiPropertyOptional({
    type: DateFormatResponseDto,
    description: 'Formato de fecha',
  })
  dateFormat?: DateFormatResponseDto;

  @ApiPropertyOptional({
    type: TimeFormatResponseDto,
    description: 'Formato de hora',
  })
  timeFormat?: TimeFormatResponseDto;

  @ApiPropertyOptional({
    type: [BusinessHoursDto],
    description: 'Horarios de atención por día',
  })
  businessHours?: BusinessHoursDto[];

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}
