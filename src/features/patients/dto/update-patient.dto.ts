import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

// Omit emergencyContacts from update (they have their own endpoints)
export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['emergencyContacts'] as const),
) {}
