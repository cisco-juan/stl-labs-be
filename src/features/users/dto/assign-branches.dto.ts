import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';

export class AssignBranchesDto {
  @ApiProperty({
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21b-12d3-a456-426614174999',
    ],
    description: 'Array de IDs de sucursales a asignar al usuario',
    type: [String],
  })
  @IsArray({ message: 'branchIds debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos una sucursal' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de sucursal debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'Los IDs de sucursales son requeridos' })
  branchIds: string[];
}
