import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true })
export class PaymentOption extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: Number, default: 0 })
  activated_amount: number;

  @Prop({ required: true })
  demat_amount: number;

  @Prop({ type: Number, default: 0 })
  activated_demat_amount: number;

  @Prop({ required: true })
  sponsor_id: string;

  @Prop({ required: true })
  payment_sponsor_id: string;

  @Prop({ required: true })
  file_path: string;

  @Prop({ required: true })
  file_key: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentOptionSchema = SchemaFactory.createForClass(PaymentOption);
