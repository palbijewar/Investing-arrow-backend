import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentOption extends Document {
  @Prop({ required: true })
  amount: string;

  @Prop()
  fileUrl?: string;
}

export const PaymentOptionSchema = SchemaFactory.createForClass(PaymentOption);
