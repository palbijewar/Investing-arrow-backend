import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, MinLength } from "class-validator";

export class UpdateUserDto {
  username: string;

  @IsEmail()
  email: string;

  @MinLength(10)
  phone: string;

  user_type: string
}

export class UpdateDepositDto{
  @IsNumber()
  amount_deposited: number;
}

export class ActivateUserDto {
  @IsBoolean()
  is_active: boolean;
}
