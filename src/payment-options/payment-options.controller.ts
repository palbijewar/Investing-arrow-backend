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
    return this.paymentOptionService.create(file, dto, req.user);
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
    @Body("demat_amount") demat_amount: number,
  ) {
    return this.paymentOptionService.updateDematAmount(
      sponsor_id,
      demat_amount,
    );
  }

  @Patch(":sponsor_id/deposit-amount")
  async updateAmountDeposited(
    @Param("sponsor_id") sponsor_id: string,
    @Body("amount") amount: number,
  ) {
    return this.paymentOptionService.updateAmountDeposited(
      sponsor_id,
      amount,
    );
  }
}
