import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class SetDefaultBranchDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la sucursal que será la sucursal por defecto del usuario',
  })
  @IsUUID('4', {
    message: 'El ID de sucursal debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
  branchId: string;
}
