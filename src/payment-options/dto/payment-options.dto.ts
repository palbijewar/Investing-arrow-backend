import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class PaymentOptionDto {
  @IsNumberString()
  amount: number;

  @IsNumberString()
  dematAmount: number;

  @IsNumberString()
  sponsor_id: string;
}

export interface UploadResult {
  file_name: string;
  file_path: string;
  file_type: string;
  thumbnail_path?: string;
  file_key: string;
  thumbnail_key?: string;
}