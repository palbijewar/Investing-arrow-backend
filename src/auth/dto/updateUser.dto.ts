import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class UpdateUserDto {
  username: string;

  @IsEmail()
  email: string;

  @MinLength(10)
  phone: string;
}
