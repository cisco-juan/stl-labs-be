import { ApiProperty } from '@nestjs/swagger';
import { PaymentInstallmentResponseDto } from './payment-installment-response.dto';

class TreatmentInfoDto {
  @ApiProperty({ description: 'ID del tratamiento' })
  id: string;

  @ApiProperty({ description: 'Nombre del tratamiento' })
  name: string;
}

export class PaymentPlanResponseDto {
  @ApiProperty({
    description: 'ID del plan de pago',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Información del tratamiento',
    type: TreatmentInfoDto,
  })
  treatment: TreatmentInfoDto;

  @ApiProperty({
    description: 'ID del tratamiento',
  })
  treatmentId: string;

  @ApiProperty({
    description: 'Número de cuotas',
    example: 6,
  })
  numberOfInstallments: number;

  @ApiProperty({
    description: 'Monto de cada cuota',
    example: 1500.0,
  })
  installmentAmount: number;

  @ApiProperty({
    description: 'Pago inicial',
    example: 1000.0,
  })
  initialPayment: number;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Cuotas del plan',
    type: [PaymentInstallmentResponseDto],
  })
  installments: PaymentInstallmentResponseDto[];
}

