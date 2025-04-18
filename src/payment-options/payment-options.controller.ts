import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, Body, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentOptionService } from './payment-options.service';
import { PaymentOptionDto } from './dto/payment-options.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment-options')
export class PaymentOptionController {
  constructor(private readonly paymentOptionService: PaymentOptionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PaymentOptionDto,
    @Req() req
  ) {
    return this.paymentOptionService.create(file, dto, req.user);
  }
}
