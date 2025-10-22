import { ApiProperty } from '@nestjs/swagger';
import { BranchResponseDto } from './branch-response.dto';
import { UserResponseDto } from './user-response.dto';

export class BranchWithUsersDto extends BranchResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Lista de usuarios asignados a la sucursal',
  })
  users: UserResponseDto[];

  @ApiProperty({
    example: 5,
    description: 'Cantidad total de usuarios asignados',
  })
  totalUsers: number;
}
