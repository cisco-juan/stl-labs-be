import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class ChangeInvoiceStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la factura',
    enum: InvoiceStatus,
    example: InvoiceStatus.CANCELED,
  })
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}

