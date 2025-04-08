import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Broker extends Document {
  @Prop({ required: true })
  brokerName: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  serverId: string;

  @Prop({ required: true })
  totalFund: string; 
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);
