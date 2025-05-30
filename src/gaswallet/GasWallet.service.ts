import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GasWallet, GasWalletSchema } from "./GasWallet.schema";
import { GasWalletDto } from "./dto/GasWallet.dto";
import { User } from "src/users/user.schema";

@Injectable()
export class GasWalletService {
  private readonly bucket: string;

  constructor(
    @InjectModel(GasWallet.name)
    private readonly gasWalletModel: Model<GasWallet>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createGasWallet(dto: GasWalletDto, paymentSponsorId: string) {
    await this.userModel.findOneAndUpdate(
      { sponsor_id: dto.sponsor_id },
      { is_active: false },
    );

    const saved = await this.gasWalletModel.create({
      gas_wallet_amount: dto.gas_wallet_amount,
      sponsor_id: dto.sponsor_id,
      payment_sponsor_id: paymentSponsorId,
    });

    return {
      status: "success",
      message: "New payment record created",
      data: saved,
    };
  }

  async getGasWalletHistory(payment_sponsor_id: string) {
    const records = await this.gasWalletModel
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
          gas_wallet_amount: record.gas_wallet_amount,
          created_at: record.createdAt,
        };
      }),
    );

    return {
      status: "success",
      data,
    };
  }

  async getTotalGasWalletFund(payment_sponsor_id: string) {
    const records = await this.gasWalletModel.find({ payment_sponsor_id });

    const totalFund = records.reduce(
      (sum, record) => sum + (record.activated_gas_wallet_amount || 0),
      0,
    );

    return {
      status: "success",
      data: {
        sponsor_id: payment_sponsor_id,
        totalGasWalletFund: totalFund,
        totalTransactions: records.length,
      },
    };
  }

  async updateGasWalletAmount(
    sponsor_id: string,
    amount: number,
    payment_sponsor_id: string,
    is_active?: boolean,
  ) {
    sponsor_id = sponsor_id.trim();

    let wallet = await this.gasWalletModel.findOne({ sponsor_id });

    if (!wallet) {
      wallet = new this.gasWalletModel({
        sponsor_id,
        gas_wallet_amount: amount,
        activated_gas_wallet_amount: is_active ? amount : 0,
        payment_sponsor_id,
      });
      await wallet.save();
    } else {
      if (is_active === true) {
        wallet.activated_gas_wallet_amount += amount;
        await wallet.save();
      } else {
        wallet.gas_wallet_amount += amount;
        await wallet.save();
      }
    }
    if (typeof is_active === "boolean") {
      const user = await this.userModel.findOneAndUpdate(
        { sponsor_id },
        { $set: { is_active } },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException(
          "User not found for sponsor_id: " + sponsor_id,
        );
      }
    }

    return {
      status: "success",
      message: "Gas wallet updated successfully",
      data: wallet,
    };
  }
}
