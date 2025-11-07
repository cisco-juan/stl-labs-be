import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { DocumentStorageService } from './services/document-storage.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, DocumentStorageService],
  exports: [PatientsService],
})
export class PatientsModule {}
