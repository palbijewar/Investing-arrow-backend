import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { PaymentOption, PaymentOptionSchema } from 'src/payment-options/payment-options.schema';
import { UsersService } from './users.service';
import { MailService } from './mail.service';
import { GasWallet, GasWalletSchema } from 'src/gaswallet/GasWallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PaymentOption.name, schema: PaymentOptionSchema },
      { name: GasWallet.name, schema: GasWalletSchema },
    ]),
  ],
  providers: [UsersService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
