import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del usuario a asignar',
  })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  userId: string;
}
