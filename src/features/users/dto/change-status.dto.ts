import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Nuevo estado del usuario',
    enum: UserStatus,
  })
  @IsEnum(UserStatus, { message: 'Estado inválido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: UserStatus;
}
