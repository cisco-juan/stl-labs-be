import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
    description: 'Nuevo estado de la cita',
  })
  @IsEnum(AppointmentStatus, { message: 'El estado debe ser válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: AppointmentStatus;
}
