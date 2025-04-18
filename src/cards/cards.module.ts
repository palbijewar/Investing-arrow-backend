import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy"; 
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { PaymentOptionsModule } from "src/payment-options/payment-options.module";

@Module({
  imports: [
    UsersModule,
    PaymentOptionsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [CardsController],
  providers: [CardsService, JwtStrategy],
  exports: [CardsService],
})
export class CardsModule {}
