import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Administrator',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@stl.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.SUPERADMIN,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Especialización del usuario',
    example: 'Odontología General',
    nullable: true,
  })
  specialization: string | null;
}
