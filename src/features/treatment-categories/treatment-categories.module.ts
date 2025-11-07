import { Module } from '@nestjs/common';
import { TreatmentCategoriesController } from './treatment-categories.controller';
import { TreatmentCategoriesService } from './treatment-categories.service';

@Module({
  controllers: [TreatmentCategoriesController],
  providers: [TreatmentCategoriesService],
  exports: [TreatmentCategoriesService],
})
export class TreatmentCategoriesModule {}
