import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus, Gender } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  fullName: string;

  @ApiProperty({
    example: 'juan.perez@stl.com',
    description: 'Email del usuario',
  })
  email: string;

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
    example: 'Odontología',
    description: 'Especialización del usuario',
  })
  specializationName?: string;
}
