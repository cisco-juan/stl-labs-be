import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus, Gender } from '@prisma/client';



export class UserResponseDtoUser {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'juan.perez@stl.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del usuario',
  })
  fullName: string;

  @ApiProperty({
    example: UserRole.DOCTOR,
    description: 'Rol del usuario',
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    example: Gender.MALE,
    description: 'Género del usuario',
    enum: Gender,
  })
  gender: Gender;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Estado del usuario',
    enum: UserStatus,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    example: '+51 999 999 999',
    description: 'Número de teléfono',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'DNI o documento de identidad',
  })
  dni?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal 456, Lima',
    description: 'Dirección',
  })
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'URL de la foto de perfil',
  })
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la especialización',
  })
  specializationId?: string;

  @ApiPropertyOptional({
    example: 'Odontología',
    description: 'Nombre de la especialización',
  })
  specializationName?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la sucursal por defecto',
  })
  defaultBranchId?: string;

  @ApiPropertyOptional({
    example: 'Sucursal Central',
    description: 'Nombre de la sucursal por defecto',
  })
  defaultBranchName?: string;

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
