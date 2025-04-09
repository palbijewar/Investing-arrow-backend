import {
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin'; 
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentOption } from './payment-options.schema';
import { PaymentOptionDto } from './dto/payment-options.dto';

@Injectable()
export class PaymentOptionService {
  constructor(@InjectModel(PaymentOption.name) private brokerModel: Model<PaymentOption>) {}

  async create(paymentOptionDto: PaymentOptionDto, file: Express.MulterS3.File): Promise<any> {
    const paymentOption = new this.brokerModel({
      ...paymentOptionDto,
      fileUrl: file?.location,
    });
    await paymentOption.save();
    return { status: 'success', data: paymentOption };
  }
}

