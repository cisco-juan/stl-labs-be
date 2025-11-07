import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, Gender, CivilStatus } from '@prisma/client';

export class PatientQueryDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Búsqueda por nombre, email, teléfono, identificación o código',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Filtro por estado del paciente',
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Filtro por género',
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({
    enum: CivilStatus,
    example: CivilStatus.SINGLE,
    description: 'Filtro por estado civil',
  })
  @IsEnum(CivilStatus)
  @IsOptional()
  civilStatus?: CivilStatus;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por doctor asignado',
  })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'Filtro por sucursal',
  })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Filtro por fecha de creación desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Filtro por fecha de creación hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  createdTo?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Filtro por fecha de última visita desde (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  lastVisitFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Filtro por fecha de última visita hasta (formato: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato válido' })
  @IsOptional()
  lastVisitTo?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filtro por pacientes con seguro dental',
  })
  @IsOptional()
  @Type(() => Boolean)
  hasDentalInsurance?: boolean;

  @ApiPropertyOptional({
    example: 'fullName',
    description: 'Campo por el cual ordenar',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    default: 'desc',
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
