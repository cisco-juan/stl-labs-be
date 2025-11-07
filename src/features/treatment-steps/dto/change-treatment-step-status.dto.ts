import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TreatmentStepStatus } from '@prisma/client';

export class ChangeTreatmentStepStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del paso',
    enum: TreatmentStepStatus,
    example: TreatmentStepStatus.COMPLETED,
  })
  @IsEnum(TreatmentStepStatus)
  @IsNotEmpty()
  status: TreatmentStepStatus;
}

