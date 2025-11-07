import { Module } from '@nestjs/common';
import { TreatmentCatalogController } from './treatment-catalog.controller';
import { TreatmentCatalogService } from './treatment-catalog.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TreatmentCatalogController],
  providers: [TreatmentCatalogService],
  exports: [TreatmentCatalogService],
})
export class TreatmentCatalogModule {}

