import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
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

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración completa de la clínica' })
  @ApiResponse({
    status: 200,
    description: 'Configuración obtenida exitosamente',
    type: ClinicSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  getSettings(): Promise<ClinicSettingsResponseDto> {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar configuración general de la clínica' })
  @ApiBody({ type: UpdateClinicSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
    type: ClinicSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o referencias no existentes',
  })
  updateSettings(
    @Body() updateDto: UpdateClinicSettingsDto,
  ): Promise<ClinicSettingsResponseDto> {
    return this.settingsService.updateSettings(updateDto);
  }

  @Get('business-hours')
  @ApiOperation({ summary: 'Obtener horarios de atención' })
  @ApiResponse({
    status: 200,
    description: 'Horarios obtenidos exitosamente',
    type: [BusinessHoursDto],
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  getBusinessHours(): Promise<BusinessHoursDto[]> {
    return this.settingsService.getBusinessHours();
  }

  @Patch('business-hours')
  @ApiOperation({ summary: 'Actualizar horarios de atención' })
  @ApiBody({ type: UpdateBusinessHoursDto })
  @ApiResponse({
    status: 200,
    description: 'Horarios actualizados exitosamente',
    type: [BusinessHoursDto],
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos (deben ser 7 días, sin duplicados)',
  })
  updateBusinessHours(
    @Body() updateDto: UpdateBusinessHoursDto,
  ): Promise<BusinessHoursDto[]> {
    return this.settingsService.updateBusinessHours(updateDto);
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Obtener catálogo de monedas disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de monedas',
    type: [CurrencyResponseDto],
  })
  getCurrencies(): Promise<CurrencyResponseDto[]> {
    return this.settingsService.getCurrencies();
  }

  @Get('timezones')
  @ApiOperation({ summary: 'Obtener catálogo de zonas horarias' })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de zonas horarias',
    type: [TimezoneResponseDto],
  })
  getTimezones(): Promise<TimezoneResponseDto[]> {
    return this.settingsService.getTimezones();
  }

  @Get('date-formats')
  @ApiOperation({ summary: 'Obtener catálogo de formatos de fecha' })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de formatos de fecha',
    type: [DateFormatResponseDto],
  })
  getDateFormats(): Promise<DateFormatResponseDto[]> {
    return this.settingsService.getDateFormats();
  }

  @Get('time-formats')
  @ApiOperation({ summary: 'Obtener catálogo de formatos de hora' })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de formatos de hora',
    type: [TimeFormatResponseDto],
  })
  getTimeFormats(): Promise<TimeFormatResponseDto[]> {
    return this.settingsService.getTimeFormats();
  }
}
