import { IsArray, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class StepOrderDto {
  @ApiProperty({
    description: 'ID del paso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  stepId: string;

  @ApiProperty({
    description: 'Nuevo orden',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderTreatmentStepsDto {
  @ApiProperty({
    description: 'Lista de pasos con sus nuevos órdenes',
    type: [StepOrderDto],
  })
  @IsArray()
  steps: StepOrderDto[];
}

