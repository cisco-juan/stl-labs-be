import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsBoolean,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, CivilStatus, DniType } from '@prisma/client';
import { CreateEmergencyContactDto } from './create-emergency-contact.dto';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombres del paciente',
  })
  @IsString({ message: 'Los nombres deben ser un texto' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MaxLength(200, { message: 'Los nombres no pueden exceder 200 caracteres' })
  firstName: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'Apellidos del paciente',
  })
  @IsString({ message: 'Los apellidos deben ser un texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MaxLength(200, { message: 'Los apellidos no pueden exceder 200 caracteres' })
  lastName: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de identificación del paciente',
  })
  @IsString({ message: 'La identificación debe ser un texto' })
  @IsNotEmpty({ message: 'La identificación es requerida' })
  @MaxLength(50, { message: 'La identificación no puede exceder 50 caracteres' })
  dni: string;

  @ApiPropertyOptional({
    enum: DniType,
    example: DniType.DNI,
    description: 'Tipo de documento de identidad',
  })
  @IsEnum(DniType, { message: 'El tipo de documento debe ser válido' })
  @IsOptional()
  dniType?: DniType;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento del paciente',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato válido' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  birthDate: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Género del paciente',
  })
  @IsEnum(Gender, { message: 'El género debe ser válido' })
  @IsNotEmpty({ message: 'El género es requerido' })
  gender: Gender;

  @ApiPropertyOptional({
    enum: CivilStatus,
    example: CivilStatus.SINGLE,
    description: 'Estado civil del paciente',
  })
  @IsEnum(CivilStatus, { message: 'El estado civil debe ser válido' })
  @IsOptional()
  civilStatus?: CivilStatus;

  @ApiPropertyOptional({
    example: 'Ingeniero de Sistemas',
    description: 'Ocupación del paciente',
  })
  @IsString({ message: 'La ocupación debe ser un texto' })
  @IsOptional()
  @MaxLength(200, { message: 'La ocupación no puede exceder 200 caracteres' })
  profession?: string;

  @ApiProperty({
    example: '+593 99 123 4567',
    description: 'Teléfono principal del paciente',
  })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono principal es requerido' })
  @MaxLength(50, { message: 'El teléfono no puede exceder 50 caracteres' })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: '+593 99 765 4321',
    description: 'Teléfono secundario del paciente',
  })
  @IsString({ message: 'El teléfono secundario debe ser un texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El teléfono secundario no puede exceder 50 caracteres' })
  secondaryPhoneNumber?: string;

  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico del paciente (debe ser único)',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiPropertyOptional({
    example: 'Quito',
    description: 'Ciudad de residencia del paciente',
  })
  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city?: string;

  @ApiPropertyOptional({
    example: 'Av. 10 de Agosto y Carrión',
    description: 'Dirección del paciente',
  })
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el paciente tiene seguro dental',
    default: false,
  })
  @IsBoolean({ message: 'El campo seguro dental debe ser verdadero o falso' })
  @IsOptional()
  hasDentalInsurance?: boolean;

  @ApiPropertyOptional({
    example: 'Redes sociales',
    description: 'Por dónde nos conoció el paciente',
  })
  @IsString({ message: 'La fuente de referencia debe ser un texto' })
  @IsOptional()
  @MaxLength(200, { message: 'La fuente de referencia no puede exceder 200 caracteres' })
  referralSource?: string;

  @ApiPropertyOptional({
    example: 'Paciente nuevo con historial previo en otra clínica',
    description: 'Notas adicionales sobre el paciente',
  })
  @IsString({ message: 'Las notas deben ser un texto' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID del doctor asignado al paciente',
  })
  @IsUUID('4', { message: 'El ID del doctor debe ser un UUID válido' })
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d',
    description: 'ID de la sucursal del paciente',
  })
  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido' })
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({
    type: [CreateEmergencyContactDto],
    description: 'Contactos de emergencia del paciente',
  })
  @IsArray({ message: 'Los contactos de emergencia deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  @IsOptional()
  emergencyContacts?: CreateEmergencyContactDto[];
}
