import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  sponsor_id: string;

  @Prop({ required: false })
  referred_by: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  package?: string;

  @Prop({ required: false })
  level?: number;

  @Prop({ default: '0' })
  profit?: string;

  @Prop({ default: '0' })
  amount_deposited: string;

  @Prop({ default: "default" })
  user_type: string;

  @Prop({ default: false })
  is_active: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
