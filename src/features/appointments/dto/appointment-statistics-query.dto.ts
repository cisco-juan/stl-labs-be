import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatisticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class AppointmentStatisticsQueryDto {
  @ApiProperty({
    description: 'Período para las estadísticas',
    enum: StatisticsPeriod,
    default: StatisticsPeriod.MONTH,
    required: false,
  })
  @IsEnum(StatisticsPeriod)
  @IsOptional()
  period?: StatisticsPeriod = StatisticsPeriod.MONTH;
}
