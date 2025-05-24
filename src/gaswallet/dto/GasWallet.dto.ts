import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class GasWalletDto {
  @IsNotEmpty()
  @IsNumberString()
  gas_wallet_amount: string;

  @IsNotEmpty()
  @IsNumberString()
  sponsor_id: string;
}
