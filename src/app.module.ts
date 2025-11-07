import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BranchesModule } from './features/branches/branches.module';
import { UsersModule } from './features/users/users.module';
import { SpecializationsModule } from './features/specializations/specializations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchesModule,
    UsersModule,
    SpecializationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
