import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class SignupDto {
  @IsNotEmpty()
  sponsor_id: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @MinLength(6)
  confirm_password: string;
}
