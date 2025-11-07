import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID del paciente',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  patientId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID del médico',
  })
  @IsUUID('4', { message: 'El ID del médico debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del médico es requerido' })
  doctorId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID del tipo de cita',
  })
  @IsUUID('4', { message: 'El ID del tipo de cita debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El tipo de cita es requerido' })
  appointmentTypeId: string;

  @ApiProperty({
    example: '2024-12-15T10:00:00.000Z',
    description: 'Fecha y hora de la cita',
  })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'La fecha y hora son requeridas' })
  dateTime: string;

  @ApiProperty({
    example: 30,
    description: 'Duración de la cita en minutos',
    default: 30,
    minimum: 15,
  })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(15, { message: 'La duración mínima es 15 minutos' })
  @IsNotEmpty({ message: 'La duración es requerida' })
  durationMinutes: number;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID de la sucursal',
  })
  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido' })
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    example: 'Paciente refiere dolor en muela inferior derecha',
    description: 'Notas adicionales sobre la cita',
  })
  @IsString({ message: 'Las notas deben ser un texto' })
  @IsOptional()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notes?: string;
}
