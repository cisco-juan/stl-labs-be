import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDtoUser } from './user-response.dto';

export class BranchBasicDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la sucursal',
  })
  id: string;

  @ApiProperty({
    example: 'Sucursal Central',
    description: 'Nombre de la sucursal',
  })
  name: string;

  @ApiProperty({
    example: 'SUC-001',
    description: 'Código de la sucursal',
  })
  code?: string;

  @ApiProperty({
    example: 'Lima',
    description: 'Ciudad',
  })
  city?: string;
}

export class UserWithBranchesDto extends UserResponseDtoUser {
  @ApiProperty({
    type: [BranchBasicDto],
    description: 'Lista de sucursales asignadas al usuario',
  })
  branches: BranchBasicDto[];

  @ApiProperty({
    example: 3,
    description: 'Cantidad total de sucursales asignadas',
  })
  totalBranches: number;
}
