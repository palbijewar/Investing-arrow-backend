import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GasWallet, GasWalletSchema } from "./GasWallet.schema";
import { GasWalletService } from "./GasWallet.service";
import { GasWalletController } from "./GasWallet.controller";
import { UsersModule } from "src/users/users.module";
import { User, UserSchema } from "src/users/user.schema";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: GasWallet.name, schema: GasWalletSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [GasWalletController],
  providers: [GasWalletService],
  exports: [GasWalletService, MongooseModule],
})
export class GasWalletModule {}
