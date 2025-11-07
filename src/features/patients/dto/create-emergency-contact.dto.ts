import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEmergencyContactDto {
  @ApiProperty({
    example: 'María Rodríguez García',
    description: 'Nombre completo del contacto de emergencia',
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  fullName: string;

  @ApiProperty({
    example: '+593 99 123 4567',
    description: 'Número de teléfono del contacto de emergencia',
  })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @MaxLength(50, { message: 'El teléfono no puede exceder 50 caracteres' })
  phoneNumber: string;

  @ApiProperty({
    example: 'Madre',
    description: 'Relación con el paciente',
  })
  @IsString({ message: 'La relación debe ser un texto' })
  @IsNotEmpty({ message: 'La relación es requerida' })
  @MaxLength(100, { message: 'La relación no puede exceder 100 caracteres' })
  relationship: string;
}
