import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum StatisticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export class TreatmentStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Período de estadísticas',
    enum: StatisticsPeriod,
    default: StatisticsPeriod.ALL,
  })
  @IsEnum(StatisticsPeriod)
  @IsOptional()
  period?: StatisticsPeriod = StatisticsPeriod.ALL;

  @ApiPropertyOptional({
    description: 'Fecha desde',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

