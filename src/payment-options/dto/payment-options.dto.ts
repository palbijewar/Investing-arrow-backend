import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class PaymentOptionDto {
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsNumberString()
  dematAmount: string;
}

export interface UploadResult {
  file_name: string;
  file_path: string;
  file_type: string;
  thumbnail_path?: string;
  file_key: string;
  thumbnail_key?: string;
}