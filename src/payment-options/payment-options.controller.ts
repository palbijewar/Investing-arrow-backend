// controller
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
  import { multerOptions } from './s3-config.service';
  
  @Controller('payment-options')
  export class BrokerController {
    constructor(private readonly paymentOptionService: PaymentOptionService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async create(
      @Body() paymentOptionDto: PaymentOptionDto,
      @UploadedFile() file: Express.MulterS3.File
    ) {
      return this.paymentOptionService.create(paymentOptionDto, file);
    }
  }
  