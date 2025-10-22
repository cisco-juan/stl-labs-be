import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@stl.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: '6366aaee36',
    description: 'Contraseña del usuario',
  })
  password: string;
}
