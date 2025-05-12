import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentOption extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  demat_amount: number;

  @Prop({ required: true })
  sponsor_id: string;

  @Prop({ required: true })
  file_path: string;

  @Prop({ required: true })
  file_key: string;
}

export const PaymentOptionSchema = SchemaFactory.createForClass(PaymentOption);
