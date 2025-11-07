import { Module } from '@nestjs/common';
import { TreatmentStepsController } from './treatment-steps.controller';
import { TreatmentStepsService } from './treatment-steps.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TreatmentsModule } from '../treatments/treatments.module';

@Module({
  imports: [PrismaModule, TreatmentsModule],
  controllers: [TreatmentStepsController],
  providers: [TreatmentStepsService],
  exports: [TreatmentStepsService],
})
export class TreatmentStepsModule {}

