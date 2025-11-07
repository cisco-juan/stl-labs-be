import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateMedicalHistoryDto {
  @ApiPropertyOptional({
    example: ['Penicilina', 'Polen'],
    description: 'Lista de alergias del paciente',
    type: [String],
  })
  @IsArray({ message: 'Las alergias deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada alergia debe ser un texto' })
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({
    example: ['Ibuprofeno 400mg', 'Losartán 50mg'],
    description: 'Medicamentos actuales del paciente',
    type: [String],
  })
  @IsArray({ message: 'Los medicamentos deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada medicamento debe ser un texto' })
  @IsOptional()
  currentMedications?: string[];

  @ApiPropertyOptional({
    example: 'Hipertensión arterial, Diabetes tipo 2',
    description: 'Condiciones médicas crónicas',
  })
  @IsString({ message: 'Las condiciones crónicas deben ser un texto' })
  @IsOptional()
  chronicConditions?: string;

  @ApiPropertyOptional({
    example: 'Padre con hipertensión, madre con diabetes',
    description: 'Antecedentes médicos familiares',
  })
  @IsString({ message: 'Los antecedentes familiares deben ser un texto' })
  @IsOptional()
  familyHistory?: string;

  @ApiPropertyOptional({
    example: 'No fuma, consume alcohol ocasionalmente',
    description: 'Hábitos del paciente (tabaco, alcohol, ejercicio)',
  })
  @IsString({ message: 'Los hábitos deben ser un texto' })
  @IsOptional()
  habits?: string;

  @ApiPropertyOptional({
    example: 'Apendicectomía en 2015',
    description: 'Cirugías previas',
  })
  @IsString({ message: 'Las cirugías previas deben ser un texto' })
  @IsOptional()
  previousSurgeries?: string;

  @ApiPropertyOptional({
    example: 'Dolor en muela inferior derecha',
    description: 'Motivo de la consulta',
  })
  @IsString({ message: 'El motivo de consulta debe ser un texto' })
  @IsOptional()
  consultationReason?: string;

  @ApiPropertyOptional({
    example: 'Paciente refiere sensibilidad al frío',
    description: 'Observaciones adicionales',
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  observations?: string;
}

export class UpdateMedicalHistoryDto extends CreateMedicalHistoryDto {}

export class MedicalHistoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId: string;

  @ApiProperty({ example: ['Penicilina', 'Polen'], type: [String] })
  allergies: string[];

  @ApiProperty({ example: ['Ibuprofeno 400mg'], type: [String] })
  currentMedications: string[];

  @ApiPropertyOptional({ example: 'Hipertensión arterial' })
  chronicConditions?: string | null;

  @ApiPropertyOptional({ example: 'Padre con hipertensión' })
  familyHistory?: string | null;

  @ApiPropertyOptional({ example: 'No fuma' })
  habits?: string | null;

  @ApiPropertyOptional({ example: 'Apendicectomía en 2015' })
  previousSurgeries?: string | null;

  @ApiPropertyOptional({ example: 'Dolor en muela' })
  consultationReason?: string | null;

  @ApiPropertyOptional({ example: 'Paciente refiere sensibilidad' })
  observations?: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
