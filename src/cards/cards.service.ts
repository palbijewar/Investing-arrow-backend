import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentOption } from 'src/payment-options/payment-options.schema';
import { User } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CardsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async getTotalPaymentsBySponsor(sponsor_id: string): Promise<number> {
    return this.paymentOptionModel.countDocuments({ sponsor_id });
  }

  async getTotalDematAmountFund(sponsor_id: string): Promise<number> {
    const result = await this.paymentOptionModel.aggregate([
      { $match: { sponsor_id } },
      {
        $group: {
          _id: null,
          totalDematAmount: { $sum: { $toDouble: "$demat_amount" } },
        },
      },
    ]);
  
    return result[0]?.totalDematAmount || 0;
  }  

  async getReferredSponsorsTotalIncome(sponsor_id: string) {
    const users = await this.usersService.getReferredSponsors(sponsor_id);

    const totalIncome = users.reduce((sum, user) => {
      const income = parseFloat(String(user.package)) || 0;
      return sum + income;
    }, 0);

    return {
      status: 'success',
      data: {
        total_income: totalIncome,
        count: users.length,
      },
    };
  }

  async getSecondLevelReferralsTotalIncome(sponsor_id: string) {
    let totalIncome = 0;
    let currentSponsors = [sponsor_id];
    let level = 0;
    const REFERRAL_PERCENTAGES = [20, 10, 5, 6, 5, 4, 4, 3, 2, 1];

    while (currentSponsors.length > 0 && level < REFERRAL_PERCENTAGES.length) {
      const users = await this.userModel.find({
        referred_by: { $in: currentSponsors },
        is_active: true,
      }).exec();

      const firstLevelSponsorIDs = users.map(user => user.sponsor_id);

      const secondLevelUsers = await this.userModel.find({
        referred_by: { $in: firstLevelSponsorIDs },
        is_active: true,
      }).exec();

      const levelIncome = secondLevelUsers.reduce((sum, user) => {
        const packageAmount = parseFloat(String(user.package)) || 0;
        const income = (packageAmount * REFERRAL_PERCENTAGES[level]) / 100;
        return sum + income;
      }, 0);

      totalIncome += levelIncome;

      currentSponsors = secondLevelUsers.map(user => user.sponsor_id);
      level++;
    }

    return {
      status: 'success',
      data: {
        total_income: totalIncome,
      },
    };
  }
}
