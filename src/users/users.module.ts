import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { PaymentOption, PaymentOptionSchema } from 'src/payment-options/payment-options.schema';
import { UsersService } from './users.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PaymentOption.name, schema: PaymentOptionSchema },
    ]),
  ],
  providers: [UsersService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
