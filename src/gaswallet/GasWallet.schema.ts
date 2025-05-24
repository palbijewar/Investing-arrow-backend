import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class GasWallet extends Document {
  @Prop({ required: true })
  gas_wallet_amount: number;

  @Prop({ required: true })
  sponsor_id: string;

  @Prop({ required: true })
  payment_sponsor_id: string;

  createdAt: Date;
  updatedAt: Date;
}

export const GasWalletSchema = SchemaFactory.createForClass(GasWallet);
