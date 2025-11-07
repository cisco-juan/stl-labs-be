import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentStepStatus, PaymentMethod } from '@prisma/client';

class TreatmentInfoDto {
  @ApiProperty({ description: 'ID del tratamiento' })
  id: string;

  @ApiProperty({ description: 'Nombre del tratamiento' })
  name: string;
}

class CatalogTreatmentInfoDto {
  @ApiProperty({ description: 'ID del tratamiento del catálogo' })
  id: string;

  @ApiProperty({ description: 'Código del tratamiento' })
  code: string;

  @ApiProperty({ description: 'Nombre del tratamiento' })
  name: string;
}

class DoctorInfoDto {
  @ApiProperty({ description: 'ID del médico' })
  id: string;

  @ApiProperty({ description: 'Nombre completo del médico' })
  fullName: string;
}

export class TreatmentStepResponseDto {
  @ApiProperty({
    description: 'ID del paso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del paso',
    example: 'Instalación de brackets superiores',
  })
  name: string;

  @ApiProperty({
    description: 'Estado del paso',
    enum: TreatmentStepStatus,
  })
  status: TreatmentStepStatus;

  @ApiPropertyOptional({
    description: 'Descripción del paso',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Información del tratamiento',
    type: TreatmentInfoDto,
  })
  treatment?: TreatmentInfoDto;

  @ApiPropertyOptional({
    description: 'ID del tratamiento',
  })
  treatmentId?: string;

  @ApiPropertyOptional({
    description: 'Información del tratamiento del catálogo',
    type: CatalogTreatmentInfoDto,
  })
  catalogTreatment?: CatalogTreatmentInfoDto;

  @ApiPropertyOptional({
    description: 'ID del tratamiento del catálogo',
  })
  catalogTreatmentId?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  notes?: string;

  @ApiProperty({
    description: 'Cantidad',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Precio del paso',
    example: 2000.0,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Información del médico',
    type: DoctorInfoDto,
  })
  doctor?: DoctorInfoDto;

  @ApiPropertyOptional({
    description: 'ID del médico',
  })
  doctorId?: string;

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
    example: 100.0,
  })
  discount: number;

  @ApiProperty({
    description: 'Porcentaje de descuento',
    example: 5.0,
  })
  discountPercentage: number;

  @ApiProperty({
    description: 'Orden del paso',
    example: 1,
  })
  order: number;

  @ApiPropertyOptional({
    description: 'Número de diente',
    example: '16',
  })
  toothNumber?: string;

  @ApiPropertyOptional({
    description: 'Unidades',
    example: ['pieza', 'superficie'],
    type: [String],
  })
  units?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de completado',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}

