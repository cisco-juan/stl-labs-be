import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, CivilStatus, DniType, UserStatus } from '@prisma/client';

export class EmergencyContactResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'María Rodríguez García' })
  fullName: string;

  @ApiProperty({ example: '+593 99 123 4567' })
  phoneNumber: string;

  @ApiProperty({ example: 'Madre' })
  relationship: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class PatientResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiPropertyOptional({ example: 'PAC-001' })
  code?: string;

  @ApiProperty({ example: 'Juan Carlos Pérez García' })
  fullName: string;

  @ApiProperty({ example: 'juan.perez@email.com' })
  email: string;

  @ApiPropertyOptional({ example: '+593 99 123 4567' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+593 99 765 4321' })
  secondaryPhoneNumber?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  dni?: string;

  @ApiPropertyOptional({ enum: DniType, example: DniType.DNI })
  dniType?: DniType;

  @ApiPropertyOptional({ example: '1990-05-15T00:00:00.000Z' })
  birthDate?: Date;

  @ApiPropertyOptional({ example: 34, description: 'Edad calculada en años' })
  age?: number;

  @ApiPropertyOptional({ example: '2024-12-01T10:30:00.000Z' })
  lastVisit?: Date;

  @ApiPropertyOptional({ enum: CivilStatus, example: CivilStatus.SINGLE })
  civilStatus?: CivilStatus;

  @ApiPropertyOptional({ example: 'Ingeniero de Sistemas' })
  profession?: string;

  @ApiPropertyOptional({ example: 'Av. 10 de Agosto y Carrión' })
  address?: string;

  @ApiPropertyOptional({ example: 'Quito' })
  city?: string;

  @ApiProperty({ example: false })
  hasDentalInsurance: boolean;

  @ApiPropertyOptional({ example: 'Redes sociales' })
  referralSource?: string;

  @ApiPropertyOptional({ example: 'Paciente nuevo con historial previo' })
  notes?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  doctorId?: string;

  @ApiPropertyOptional({ example: 'Dr. Roberto Martínez' })
  doctorName?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  branchId?: string;

  @ApiPropertyOptional({ example: 'Sucursal Centro' })
  branchName?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: [EmergencyContactResponseDto] })
  emergencyContacts?: EmergencyContactResponseDto[];
}
