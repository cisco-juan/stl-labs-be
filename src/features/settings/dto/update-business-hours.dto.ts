import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { BusinessHoursDto } from './business-hours.dto';

export class UpdateBusinessHoursDto {
  @ApiProperty({
    type: [BusinessHoursDto],
    description: 'Array de horarios para cada día de la semana (debe contener exactamente 7 días)',
    example: [
      {
        dayOfWeek: 'MONDAY',
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
      {
        dayOfWeek: 'TUESDAY',
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
      // ... otros días
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  @ArrayMinSize(7, { message: 'Debe proporcionar horarios para los 7 días de la semana' })
  @ArrayMaxSize(7, { message: 'Solo puede proporcionar horarios para 7 días' })
  businessHours: BusinessHoursDto[];
}
