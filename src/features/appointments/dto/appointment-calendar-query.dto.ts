import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsDateString, IsString } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export enum CalendarView {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
}

export class AppointmentCalendarQueryDto {
  @ApiProperty({
    enum: CalendarView,
    example: CalendarView.TODAY,
    description: 'Vista del calendario: hoy, semana o mes',
  })
  @IsEnum(CalendarView, { message: 'La vista debe ser válida (today, week, month)' })
  @IsNotEmpty({ message: 'La vista es requerida' })
  view: CalendarView;

  @ApiPropertyOptional({
    example: '2024-12-15',
    description: 'Fecha de referencia (formato: YYYY-MM-DD). Por defecto es hoy',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
    description: 'Filtro por estado',
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por médico',
  })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por paciente',
  })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por sucursal',
  })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Búsqueda por nombre',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
