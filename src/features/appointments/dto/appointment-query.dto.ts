import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class AppointmentQueryDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Búsqueda por nombre de paciente, médico o notas',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
    description: 'Filtro por estado de la cita',
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
    example: '2024-12-01',
    description: 'Filtro por fecha desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Filtro por fecha hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({
    example: 'dateTime',
    description: 'Campo por el cual ordenar',
    default: 'dateTime',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de resultados por página',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  limit?: string;
}
