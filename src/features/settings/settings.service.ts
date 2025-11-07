import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateClinicSettingsDto,
  ClinicSettingsResponseDto,
  BusinessHoursDto,
  UpdateBusinessHoursDto,
  CurrencyResponseDto,
  TimezoneResponseDto,
  DateFormatResponseDto,
  TimeFormatResponseDto,
} from './dto';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<ClinicSettingsResponseDto> {
    const settings = await this.prisma.clinicSettings.findFirst({
      include: {
        defaultTimezone: true,
        defaultCurrency: true,
        dateFormat: true,
        timeFormat: true,
        businessHours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    if (!settings) {
      throw new NotFoundException(
        'No se encontró la configuración de la clínica',
      );
    }

    return settings as any;
  }

  async updateSettings(
    updateDto: UpdateClinicSettingsDto,
  ): Promise<ClinicSettingsResponseDto> {
    // Verificar que existe la configuración
    const existingSettings = await this.prisma.clinicSettings.findFirst();

    if (!existingSettings) {
      throw new NotFoundException(
        'No se encontró la configuración de la clínica',
      );
    }

    // Validar que existan las referencias si se están actualizando
    if (updateDto.defaultTimezoneId) {
      const timezone = await this.prisma.timezone.findUnique({
        where: { id: updateDto.defaultTimezoneId },
      });
      if (!timezone) {
        throw new BadRequestException('La zona horaria especificada no existe');
      }
    }

    if (updateDto.defaultCurrencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: updateDto.defaultCurrencyId },
      });
      if (!currency) {
        throw new BadRequestException('La moneda especificada no existe');
      }
    }

    if (updateDto.dateFormatId) {
      const dateFormat = await this.prisma.dateFormat.findUnique({
        where: { id: updateDto.dateFormatId },
      });
      if (!dateFormat) {
        throw new BadRequestException(
          'El formato de fecha especificado no existe',
        );
      }
    }

    if (updateDto.timeFormatId) {
      const timeFormat = await this.prisma.timeFormat.findUnique({
        where: { id: updateDto.timeFormatId },
      });
      if (!timeFormat) {
        throw new BadRequestException(
          'El formato de hora especificado no existe',
        );
      }
    }

    // Actualizar configuración
    const updatedSettings = await this.prisma.clinicSettings.update({
      where: { id: existingSettings.id },
      data: updateDto,
      include: {
        defaultTimezone: true,
        defaultCurrency: true,
        dateFormat: true,
        timeFormat: true,
        businessHours: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    return updatedSettings as any;
  }

  async getBusinessHours(): Promise<BusinessHoursDto[]> {
    const settings = await this.prisma.clinicSettings.findFirst();

    if (!settings) {
      throw new NotFoundException(
        'No se encontró la configuración de la clínica',
      );
    }

    const businessHours = await this.prisma.businessHours.findMany({
      where: { clinicSettingsId: settings.id },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return businessHours as BusinessHoursDto[];
  }

  async updateBusinessHours(
    updateDto: UpdateBusinessHoursDto,
  ): Promise<BusinessHoursDto[]> {
    const settings = await this.prisma.clinicSettings.findFirst();

    if (!settings) {
      throw new NotFoundException(
        'No se encontró la configuración de la clínica',
      );
    }

    // Validar que se proporcionen exactamente 7 días
    const daysOfWeek = updateDto.businessHours.map((bh) => bh.dayOfWeek);
    const uniqueDays = new Set(daysOfWeek);

    if (uniqueDays.size !== 7) {
      throw new BadRequestException(
        'Debe proporcionar horarios para los 7 días de la semana sin duplicados',
      );
    }

    // Validar que todos los días de la semana estén presentes
    const allDays = Object.values(DayOfWeek);
    for (const day of allDays) {
      if (!daysOfWeek.includes(day)) {
        throw new BadRequestException(
          `Falta el día ${day} en la configuración de horarios`,
        );
      }
    }

    // Validar que si isOpen es true, openTime y closeTime deben estar presentes
    for (const bh of updateDto.businessHours) {
      if (bh.isOpen && (!bh.openTime || !bh.closeTime)) {
        throw new BadRequestException(
          `Si el día ${bh.dayOfWeek} está abierto, debe especificar openTime y closeTime`,
        );
      }
    }

    // Actualizar horarios
    const updatedHours = await Promise.all(
      updateDto.businessHours.map(async (bh) => {
        return await this.prisma.businessHours.upsert({
          where: {
            clinicSettingsId_dayOfWeek: {
              clinicSettingsId: settings.id,
              dayOfWeek: bh.dayOfWeek,
            },
          },
          update: {
            isOpen: bh.isOpen,
            openTime: bh.isOpen ? bh.openTime : null,
            closeTime: bh.isOpen ? bh.closeTime : null,
          },
          create: {
            clinicSettingsId: settings.id,
            dayOfWeek: bh.dayOfWeek,
            isOpen: bh.isOpen,
            openTime: bh.isOpen ? bh.openTime : null,
            closeTime: bh.isOpen ? bh.closeTime : null,
          },
        });
      }),
    );

    return updatedHours as BusinessHoursDto[];
  }

  async getCurrencies(): Promise<CurrencyResponseDto[]> {
    const currencies = await this.prisma.currency.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return currencies as CurrencyResponseDto[];
  }

  async getTimezones(): Promise<TimezoneResponseDto[]> {
    const timezones = await this.prisma.timezone.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return timezones as TimezoneResponseDto[];
  }

  async getDateFormats(): Promise<DateFormatResponseDto[]> {
    const dateFormats = await this.prisma.dateFormat.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return dateFormats as DateFormatResponseDto[];
  }

  async getTimeFormats(): Promise<TimeFormatResponseDto[]> {
    const timeFormats = await this.prisma.timeFormat.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return timeFormats as TimeFormatResponseDto[];
  }
}
