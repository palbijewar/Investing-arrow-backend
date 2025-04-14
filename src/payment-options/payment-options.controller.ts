import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentOptionDto } from './dto/payment-options.dto';
import { PaymentOptionService } from './payment-options.service';

@Controller('payment-options')
export class PaymentOptionController {
  constructor(private paymentOptionService: PaymentOptionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PaymentOptionDto,
  ) {
    console.log({file,dto});
    
    return this.paymentOptionService.create(file, dto);
  }
}
