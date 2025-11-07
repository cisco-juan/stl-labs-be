import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentStatus, PaymentMethod } from '@prisma/client';

class PatientInfoDto {
  @ApiProperty({ description: 'ID del paciente' })
  id: string;

  @ApiProperty({ description: 'Nombre completo del paciente' })
  fullName: string;
}

class DoctorInfoDto {
  @ApiProperty({ description: 'ID del médico' })
  id: string;

  @ApiProperty({ description: 'Nombre completo del médico' })
  fullName: string;
}

class BranchInfoDto {
  @ApiProperty({ description: 'ID de la sucursal' })
  id: string;

  @ApiProperty({ description: 'Nombre de la sucursal' })
  name: string;
}

export class TreatmentResponseDto {
  @ApiProperty({
    description: 'ID del tratamiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del tratamiento',
    example: 'Tratamiento de Ortodoncia Completo',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tratamiento',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Código del tratamiento',
  })
  code?: string;

  @ApiProperty({
    description: 'Estado del tratamiento',
    enum: TreatmentStatus,
  })
  status: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Diagnóstico',
  })
  diagnosis?: string;

  @ApiPropertyOptional({
    description: 'Pronóstico',
  })
  prognosis?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin',
  })
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de validez',
  })
  validityDate?: Date;

  @ApiPropertyOptional({
    description: 'Información del paciente',
    type: PatientInfoDto,
  })
  patient?: PatientInfoDto;

  @ApiPropertyOptional({
    description: 'ID del paciente',
  })
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Información del médico',
    type: DoctorInfoDto,
  })
  doctor?: DoctorInfoDto;

  @ApiPropertyOptional({
    description: 'ID del médico',
  })
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Información de la sucursal',
    type: BranchInfoDto,
  })
  branch?: BranchInfoDto;

  @ApiPropertyOptional({
    description: 'ID de la sucursal',
  })
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  notes?: string;

  @ApiProperty({
    description: 'Total de pasos',
    example: 5,
  })
  totalSteps: number;

  @ApiProperty({
    description: 'Pasos completados',
    example: 2,
  })
  completedSteps: number;

  @ApiProperty({
    description: 'Precio total',
    example: 10000.0,
  })
  price: number;

  @ApiProperty({
    description: 'Indica si está pagado',
    example: false,
  })
  isPaid: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de pago',
  })
  paymentDate?: Date;

  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: PaymentMethod,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Descuento aplicado',
    example: 500.0,
  })
  discount: number;

  @ApiProperty({
    description: 'Porcentaje de descuento',
    example: 5.0,
  })
  discountPercentage: number;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Cantidad de pasos del tratamiento',
    example: 5,
  })
  stepCount?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de citas vinculadas',
    example: 3,
  })
  appointmentCount?: number;
}

