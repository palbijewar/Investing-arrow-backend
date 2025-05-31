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
  Put,
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
  async createPaymentOption(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PaymentOptionDto,
    @Req() req,
  ) {
    return this.paymentOptionService.createPaymentOption(file, dto, req.user.sponsor_id);
  }

  @Get("pdf/:sponsor_id")
  async getPdf(@Param("sponsor_id") sponsor_id: string) {
    const result =
      await this.paymentOptionService.getPdfBySponsorId(sponsor_id);
    return result;
  }

  @Put(":sponsor_id")
  async updatePaymentOption(
    @Param("sponsor_id") sponsor_id: string,
    @Body() body: any,
  ) {
    return this.paymentOptionService.updatePaymentOption(
      sponsor_id,
      body,
    );
  }

  @Get("history/:sponsor_id")
  getHistory(@Param("sponsor_id") sponsor_id: string) {
    return this.paymentOptionService.getSponsorPaymentHistory(sponsor_id);
  }

  @Patch(":sponsor_id/demat-amount")
  async updateDematAmount(
    @Param("sponsor_id") sponsor_id: string,
    @Body() body: any,
  ) {
    return this.paymentOptionService.updateDematAmount(
      sponsor_id,
      body.demat_amount,
    );
  };

  @Patch(":sponsor_id/amount")
  async updateAmount(
    @Param("sponsor_id") sponsor_id: string,
    @Body() body: any,
  ) {
    return this.paymentOptionService.updateAmount(
      sponsor_id,
      body.amount,
    );
  };

  @Get(":sponsor_id/expiry")
async getExpiry(@Param("sponsor_id") sponsor_id: string) {
  return this.paymentOptionService.getExpiryInfo(sponsor_id);
};
}
