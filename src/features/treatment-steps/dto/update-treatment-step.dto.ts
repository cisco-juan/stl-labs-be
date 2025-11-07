import { PartialType } from '@nestjs/swagger';
import { CreateTreatmentStepDto } from './create-treatment-step.dto';

export class UpdateTreatmentStepDto extends PartialType(
  CreateTreatmentStepDto,
) {}

