import { PartialType } from '@nestjs/swagger';
import { CreateTreatmentCatalogDto } from './create-treatment-catalog.dto';

export class UpdateTreatmentCatalogDto extends PartialType(
  CreateTreatmentCatalogDto,
) {}

