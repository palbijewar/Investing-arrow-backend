import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentOption } from "./payment-options.schema";
import { PaymentOptionDto } from "./dto/payment-options.dto";
import { S3Service } from "./s3-config.service";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import * as path from "path";

@Injectable()
export class PaymentOptionService {
  private readonly bucket: string;

  constructor(
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>("AWS_BUCKET_NAME")!;
  }

  async create(file: Express.Multer.File, dto: PaymentOptionDto, user: any) {
    const sponsor_id = user.sponsor_id;

    const key = `payment_uploads/${Date.now()}_${file.originalname}`;

    const uploadResult = await this.s3Service.uploadFile(
      file.buffer,
      this.bucket,
      key,
      file.mimetype,
      "attachment",
    );

    const saved = await this.paymentOptionModel.create({
      amount: dto.amount,
      demat_amount: dto.dematAmount,
      sponsor_id: sponsor_id,
      file_path: uploadResult.Location,
      file_key: uploadResult.Key,
    });

    return {
      status: "success",
      data: saved,
    };
  }

  async getPdfBySponsorId(sponsor_id: string) {
    const record = await this.paymentOptionModel.findOne({ sponsor_id });

    if (!record || !record.file_path) {
      throw new NotFoundException("PDF not found for this sponsor ID");
    }
  
    return {
      status: "success",
      data:record.file_path
    };
  }
}
