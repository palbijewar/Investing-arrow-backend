import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentOption } from "./payment-options.schema";
import { PaymentOptionDto } from "./dto/payment-options.dto";
import { S3Service } from "./s3-config.service";
import { ConfigService } from "@nestjs/config";
import { User } from "src/users/user.schema";

@Injectable()
export class PaymentOptionService {
  private readonly bucket: string;

  constructor(
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>("AWS_BUCKET_NAME")!;
  }

  async createPaymentOption(
    file: Express.Multer.File,
    dto: PaymentOptionDto,
    paymentSponsorId: string,
  ) {
    const key = `payment_uploads/${Date.now()}_${file.originalname}`;
  
    const uploadResult = await this.s3Service.uploadFile(
      file.buffer,
      this.bucket,
      key,
      file.mimetype,
      "attachment",
    );
  
    let paymentOption = await this.paymentOptionModel.findOne({ sponsor_id: dto.sponsor_id });
  
    if (paymentOption) {
      if (dto.dematAmount) {
        paymentOption.demat_amount = (paymentOption.demat_amount || 0) + dto.dematAmount;
      }
      if (dto.amount) {
        paymentOption.amount = (paymentOption.amount || 0) + dto.amount;
      }
  
      paymentOption.file_path = uploadResult.Location!;
      paymentOption.file_key = uploadResult.Key!;

      await paymentOption.save();
    } else {
      paymentOption = await this.paymentOptionModel.create({
        amount: dto.amount,
        demat_amount: dto.dematAmount,
        sponsor_id: dto.sponsor_id,
        file_path: uploadResult.Location,
        file_key: uploadResult.Key,
        payment_sponsor_id: paymentSponsorId,
      });
    }
  
    await this.userModel.findOneAndUpdate(
      { sponsor_id: dto.sponsor_id },
      { is_active: false },
    );
  
    return {
      status: "success",
      message: "Payment option created",
      data: paymentOption,
    };
  }  

  async getPdfBySponsorId(sponsor_id: string) {
    const record = await this.paymentOptionModel.findOne({ sponsor_id });

    if (!record) {
      throw new NotFoundException("PDF not found for this sponsor ID");
    }

    return {
      status: "success",
      data: {
        file_path: record.file_path,
        demat_amount: record.demat_amount,
        amount: record.amount,
      },
    };
  }

  // async updateDematAmount(
  //   sponsor_id: string,
  //   demat_amount: number,
  //   is_active?: boolean
  // ): Promise<any> {
  //   const updated = await this.paymentOptionModel.findOneAndUpdate(
  //     { sponsor_id },
  //     { $set: { demat_amount } },
  //     { new: true, upsert: true }
  //   );
  
  //   if (typeof is_active === 'boolean') {
  //     await this.userModel.findOneAndUpdate(
  //       { sponsor_id },
  //       { $set: { is_active } },
  //       { new: true }
  //     );
  //   }
  
  //   return {
  //     status: 'success',
  //     message: 'Demat amount updated or created',
  //     data: updated,
  //   };
  // } 

  async getSponsorPaymentHistory(payment_sponsor_id: string) {
    const records = await this.paymentOptionModel
      .find({ payment_sponsor_id })
      .sort({ createdAt: -1 });

    if (!records.length) {
      throw new NotFoundException("No payment history found for this sponsor");
    }

    const data = await Promise.all(
      records.map(async (record) => {
        const sponsor = await this.userModel
          .findOne({ sponsor_id: record.sponsor_id })
          .select("username")
          .lean();
        return {
          sponsor_id: record.sponsor_id,
          sponsor_name: sponsor?.username || "Unknown",
          payment_sponsor_id: record.payment_sponsor_id,
          amount: record.amount,
          demat_amount: record.demat_amount,
          file_path: record.file_path,
          file_key: record.file_key,
          created_at: record.createdAt,
        };
      }),
    );

    return {
      status: "success",
      data,
    };
  }

  async updatePaymentAmount(
    sponsor_id: string,
    amount: number,
    type: 'amount' | 'demat',
  ) {
    sponsor_id = sponsor_id.trim();
  
    const paymentOption = await this.paymentOptionModel.findOne({ sponsor_id });
    if (!paymentOption) {
      throw new NotFoundException("Payment option not found for sponsor");
    }
  
    if (type === 'amount') {
      paymentOption.activated_amount = (paymentOption.activated_amount || 0) + amount;
      paymentOption.amount = (paymentOption.amount || 0) + amount;
    } else if (type === 'demat') {
      paymentOption.activated_demat_amount = (paymentOption.activated_demat_amount || 0) + amount;
      paymentOption.demat_amount = (paymentOption.demat_amount || 0) + amount;
    } else {
      throw new Error("Invalid type. Must be 'amount' or 'demat'");
    }
  
    await paymentOption.save();
  
    return {
      status: 'success',
      message: `Updated ${type} successfully`,
      data: paymentOption,
    };
  }  

  async updatePaymentOption(
    sponsor_id: string,
    dto: Partial<{ amount: number; demat_amount: number }>,
  ) {
    sponsor_id = sponsor_id.trim();
  
    const paymentOption = await this.paymentOptionModel.findOne({ sponsor_id });
    if (!paymentOption) {
      throw new NotFoundException("Payment option not found for sponsor");
    }
  
    if (typeof dto.amount === 'number') {
      paymentOption.activated_amount = (paymentOption.activated_amount || 0) + dto.amount;
    }
  
    if (typeof dto.demat_amount === 'number') {
      paymentOption.activated_demat_amount = (paymentOption.activated_demat_amount || 0) + dto.demat_amount;
    }
  
    await paymentOption.save();
  
    return {
      status: "success",
      message: "Payment option updated successfully",
      data: paymentOption,
    };
  }  
}
