import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentOption } from 'src/payment-options/payment-options.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CardsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
  ) {}

  async getTotalPaymentsBySponsor(sponsor_id: string): Promise<number> {
    return this.paymentOptionModel.countDocuments({ sponsor_id });
  }
}
