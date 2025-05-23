import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentOption, PaymentOptionSchema } from './payment-options.schema';
import { PaymentOptionService } from './payment-options.service';
import { PaymentOptionController } from './payment-options.controller';
import { S3Service } from './s3-config.service';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: PaymentOption.name, schema: PaymentOptionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [PaymentOptionController],
  providers: [PaymentOptionService, S3Service],
  exports: [PaymentOptionService, MongooseModule],
})

export class PaymentOptionsModule {}
