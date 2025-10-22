import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'NewPassword123!',
    description:
      'Nueva contraseña para el usuario (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La nueva contraseña debe incluir al menos una mayúscula, una minúscula y un número',
  })
  newPassword: string;
}
