import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BranchesModule } from './features/branches/branches.module';
import { UsersModule } from './features/users/users.module';
import { SpecializationsModule } from './features/specializations/specializations.module';
import { SettingsModule } from './features/settings/settings.module';
import { PatientsModule } from './features/patients/patients.module';
import { AppointmentsModule } from './features/appointments/appointments.module';
import { TreatmentCategoriesModule } from './features/treatment-categories/treatment-categories.module';
import { TreatmentCatalogModule } from './features/treatment-catalog/treatment-catalog.module';
import { TreatmentsModule } from './features/treatments/treatments.module';
import { TreatmentStepsModule } from './features/treatment-steps/treatment-steps.module';
import { PaymentPlansModule } from './features/payment-plans/payment-plans.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    BranchesModule,
    UsersModule,
    SpecializationsModule,
    SettingsModule,
    PatientsModule,
    AppointmentsModule,
    TreatmentCategoriesModule,
    TreatmentCatalogModule,
    TreatmentsModule,
    TreatmentStepsModule,
    PaymentPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
