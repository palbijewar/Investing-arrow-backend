import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  Get,
  Param,
  Res,
  Patch,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PaymentOptionService } from "./payment-options.service";
import { PaymentOptionDto } from "./dto/payment-options.dto";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

@Controller("payment-options")
export class PaymentOptionController {
  constructor(private readonly paymentOptionService: PaymentOptionService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PaymentOptionDto,
    @Req() req,
  ) {
    return this.paymentOptionService.create(file, dto, req.user.sponsor_id);
  }

  @Get("pdf/:sponsor_id")
  async getPdf(@Param("sponsor_id") sponsor_id: string) {
    const result =
      await this.paymentOptionService.getPdfBySponsorId(sponsor_id);
    return result;
  }

  @Patch(":sponsor_id/demat-amount")
  async updateDematAmount(
    @Param("sponsor_id") sponsor_id: string,
    @Body() body: any,
  ) {
    return this.paymentOptionService.updateDematAmount(
      sponsor_id,
      body.demat_amount,
      body.payment_sponsor_id,
      body.is_active,
    );
  }

  @Patch(":sponsor_id/deposit-amount")
  async updateAmountDeposited(
    @Param("sponsor_id") sponsor_id: string,
    @Body() body: any,
  ) {
    return this.paymentOptionService.updateAmountDeposited(
      sponsor_id,
      body.amount,
      body.payment_sponsor_id,
      body.is_active,
    );
  }  

  @Get("history/:sponsor_id")
  getHistory(@Param("sponsor_id") sponsor_id: string) {
    return this.paymentOptionService.getSponsorPaymentHistory(sponsor_id);
  }
}
