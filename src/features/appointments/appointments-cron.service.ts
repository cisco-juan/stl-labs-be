import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsCronService {
  private readonly logger = new Logger(AppointmentsCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every day at 1:00 AM
   * Expires appointments that are past their date/time and not confirmed or completed
   */
  @Cron('0 1 * * *', {
    name: 'expire-old-appointments',
    timeZone: 'America/Guayaquil', // Adjust to your timezone
  })
  async expireOldAppointments() {
    this.logger.log('Running cron job to expire old appointments');

    try {
      const now = new Date();

      const result = await this.prisma.appointment.updateMany({
        where: {
          dateTime: {
            lt: now,
          },
          status: {
            in: [AppointmentStatus.PENDING],
          },
        },
        data: {
          status: AppointmentStatus.EXPIRED,
        },
      });

      this.logger.log(
        `Expired ${result.count} appointments that were past their date/time`,
      );
    } catch (error) {
      this.logger.error('Error expiring old appointments', error);
    }
  }
}
