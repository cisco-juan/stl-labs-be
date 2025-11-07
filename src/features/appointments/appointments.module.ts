import { Module } from '@nestjs/common';
import { AppointmentsController, AppointmentTypesController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsCronService } from './appointments-cron.service';

@Module({
  controllers: [AppointmentsController, AppointmentTypesController],
  providers: [AppointmentsService, AppointmentsCronService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
