import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStatus } from '@prisma/client';

export class ChangeTreatmentStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del tratamiento',
    enum: TreatmentStatus,
    example: TreatmentStatus.CONFIRMED,
  })
  @IsEnum(TreatmentStatus)
  @IsNotEmpty()
  status: TreatmentStatus;
}

