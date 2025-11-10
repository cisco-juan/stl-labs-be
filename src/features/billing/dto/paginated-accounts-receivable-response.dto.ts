import { ApiProperty } from '@nestjs/swagger';
import { AccountsReceivableResponseDto } from './accounts-receivable-response.dto';
import { PaginationMetaDto } from './paginated-invoice-response.dto';

export class PaginatedAccountsReceivableResponseDto {
  @ApiProperty({ type: [AccountsReceivableResponseDto] })
  data: AccountsReceivableResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

