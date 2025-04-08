import { IsNotEmpty, IsString, IsNumberString } from 'class-validator';

export class BrokerDto {
  @IsNotEmpty()
  @IsString()
  brokerName: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  serverId: string;

  @IsNotEmpty()
  @IsNumberString()
  totalFund: string;
}
