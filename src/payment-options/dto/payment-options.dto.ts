import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentOptionDto {
  @IsNotEmpty()
  @IsString()
  amount: string;
}
