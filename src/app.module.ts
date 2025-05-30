import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BrokerDetailsModule } from './broker-details/broker-details.module';
import { PaymentOptionsModule } from './payment-options/payment-options.module';
import { CardsModule } from './cards/cards.module';
import { GasWalletModule } from './gaswallet/GasWallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URL'),
      }),
      inject: [ConfigService],
    }),
    GasWalletModule,
    BrokerDetailsModule,
    PaymentOptionsModule,
    CardsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
