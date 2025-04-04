import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  sponsor_id: string;

  @IsNotEmpty()
  password: string;
}
