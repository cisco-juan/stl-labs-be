import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class AppointmentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: '2024-12-15T10:00:00.000Z' })
  dateTime: Date;

  @ApiProperty({ example: 30, description: 'Duración en minutos' })
  durationMinutes: number;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Dolor en muela inferior' })
  notes?: string | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId?: string | null;

  @ApiPropertyOptional({ example: 'Juan Carlos Pérez García' })
  patientName?: string | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  doctorId?: string | null;

  @ApiPropertyOptional({ example: 'Dr. Roberto Martínez' })
  doctorName?: string | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  appointmentTypeId?: string | null;

  @ApiPropertyOptional({ example: 'Consulta' })
  appointmentTypeName?: string | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  branchId?: string | null;

  @ApiPropertyOptional({ example: 'Sucursal Centro' })
  branchName?: string | null;

  @ApiProperty({ example: '2024-12-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-12-01T10:00:00.000Z' })
  updatedAt: Date;
}
