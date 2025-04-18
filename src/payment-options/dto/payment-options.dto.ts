import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentOptionDto {
  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  demat_amount: string;
}

export interface UploadResult {
  file_name: string;
  file_path: string;
  file_type: string;
  thumbnail_path?: string;
  file_key: string;
  thumbnail_key?: string;
}