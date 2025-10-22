import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BranchesModule } from './features/branches/branches.module';
import { UsersModule } from './features/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, BranchesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
