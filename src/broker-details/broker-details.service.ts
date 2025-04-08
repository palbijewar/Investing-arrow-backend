import {
  Injectable,
} from '@nestjs/common';
import * as admin from 'firebase-admin'; 
import { InjectModel } from '@nestjs/mongoose';
import { BrokerDto } from './dto/broker-details.dto';
import { Model } from 'mongoose';
import { Broker } from './broker-details.schema';

@Injectable()
export class BrokerService {
  constructor(@InjectModel(Broker.name) private brokerModel: Model<Broker>) {}

  async create(brokerDto: BrokerDto): Promise<any> {
    const broker = new this.brokerModel(brokerDto);
    await broker.save();
    return { status:"success", data: broker };
  }

  async findAll(): Promise<any> {
    const broker = await this.brokerModel.find().exec();
    
    return { status:"success", data: broker };
  }
}

