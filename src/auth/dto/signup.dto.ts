import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class SignupDto {
  @IsNotEmpty()
  sponsor_id: string;

  @IsNotEmpty()
  referred_by: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(10)
  phone: string;

  @MinLength(6)
  password: string;

  @MinLength(6)
  confirm_password: string;
}
