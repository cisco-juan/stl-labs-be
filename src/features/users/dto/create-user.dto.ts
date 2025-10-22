import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole, Gender, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'juan.perez@stl.com',
    description: 'Email del usuario (debe ser único)',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    example: UserRole.DOCTOR,
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Rol inválido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: UserRole;

  @ApiProperty({
    example: Gender.MALE,
    description: 'Género del usuario',
    enum: Gender,
  })
  @IsEnum(Gender, { message: 'Género inválido' })
  @IsNotEmpty({ message: 'El género es requerido' })
  gender: Gender;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Contraseña del usuario (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe incluir al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiPropertyOptional({
    example: UserStatus.ACTIVE,
    description: 'Estado inicial del usuario',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  @IsEnum(UserStatus, { message: 'Estado inválido' })
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    example: '+51 999 999 999',
    description: 'Número de teléfono del usuario',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la especialización del usuario',
  })
  @IsUUID('4', { message: 'El ID de especialización debe ser un UUID válido' })
  @IsOptional()
  specializationId?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'DNI o documento de identidad',
  })
  @IsString()
  @IsOptional()
  dni?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal 456, Lima',
    description: 'Dirección del usuario',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'URL de la foto de perfil',
  })
  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la sucursal por defecto',
  })
  @IsUUID('4', {
    message: 'El ID de sucursal por defecto debe ser un UUID válido',
  })
  @IsOptional()
  defaultBranchId?: string;
}
