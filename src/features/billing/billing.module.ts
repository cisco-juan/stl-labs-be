import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, PdfGeneratorService],
  exports: [BillingService],
})
export class BillingModule {}

