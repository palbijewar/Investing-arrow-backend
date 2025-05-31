import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  Get,
  Param,
  Res,
  Patch,
  Put,
} from "@nestjs/common";
import { GasWalletService } from "./GasWallet.service";
import { GasWalletDto } from "./dto/GasWallet.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("gaswallet")
export class GasWalletController {
  constructor(private readonly gasWalletService: GasWalletService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async create(@Body() dto: GasWalletDto, @Req() req) {
    return this.gasWalletService.createGasWallet(dto, req.user.sponsor_id);
  }

  @Get("history/:sponsor_id")
  getHistory(@Param("sponsor_id") sponsor_id: string) {
    return this.gasWalletService.getGasWalletHistory(sponsor_id);
  }

  @Get("total-fund/:sponsorId")
  async getTotalGasWallet(@Param("sponsorId") sponsorId: string) {
    return this.gasWalletService.getTotalGasWalletFund(sponsorId);
  }

  @Patch(":sponsorId")
  async updateGasWalletAmount(
    @Param("sponsorId") sponsorId: string,
    @Body() dto: any,
  ) {
    
    return this.gasWalletService.updateGasWalletAmount(
      sponsorId,
      dto.gas_wallet_amount,
      dto.payment_sponsor_id,
      dto.is_active,
    );
  }

  @Put(":sponsor_id/gas-wallet-update")
  async updateGasWalletAmountStrictly(
    @Param("sponsorId") sponsorId: string,
    @Body() dto: any,
  ) {
    
    return this.gasWalletService.updateGasWalletAmountStrictly(
      sponsorId,
      dto.gas_wallet_amount,
    );
  }
}
