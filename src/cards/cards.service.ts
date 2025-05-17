import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaymentOption } from "src/payment-options/payment-options.schema";
import { User } from "src/users/user.schema";
import { UsersService } from "src/users/users.service";

@Injectable()
export class CardsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // 1. Direct bot count
  async getDirectbotCount(sponsor_id: string): Promise<number> {
    const directUsers = await this.userModel.countDocuments({
      referred_by: sponsor_id,
      is_active: true,
    });
    return directUsers;
  }

  // 2. Downline bot count
  async getActiveDownlineUsers(sponsor_id: string): Promise<any> {
    let downline: User[] = [];
  
    const directReferrals = await this.userModel.find({
      referred_by: sponsor_id,
    }).lean();
  
    const directSponsorIds = directReferrals.map(user => user.sponsor_id);
  
    let nextSponsorIds = [...directSponsorIds];
  
    while (nextSponsorIds.length > 0) {
      const users = await this.userModel.find({
        referred_by: { $in: nextSponsorIds },
        is_active: true,
      }).lean();
  
      downline = downline.concat(users);
      nextSponsorIds = users.map((user) => user.sponsor_id);
    }
  
    return downline;
  } 

  // 1. Direct Portfolio Investment
async botDirectPortfolioInvestment(sponsor_id: string): Promise<number> {
  const directUsers = await this.userModel
  .find({ referred_by: sponsor_id, is_active: true })
  .select('package')
  .exec();
  
  const total = directUsers.reduce((sum, user) => sum + Number(user.package || 0), 0);
  return total;
  }
  
  // 2. Downline Portfolio Investment
  async botDownlinePortfolioInvestment(sponsor_id: string): Promise<number> {
  const downlineUsers = await this.getActiveDownlineUsers(sponsor_id);
  
  const total = downlineUsers.reduce((sum, user) => sum + Number(user.package || 0), 0);
  return total;
  }

// 1. Direct portfolio Investment
  async directPortfolioInvestment(sponsor_id: string): Promise<number> {
    const directUsers = await this.userModel
      .find({ referred_by: sponsor_id })
      .exec();
    const userIds = directUsers.map((user) => user.sponsor_id.toString());

    if (userIds.length === 0) return 0;

    const result = await this.paymentOptionModel.aggregate([
      { $match: { sponsor_id: { $in: userIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$demat_amount" } },
        },
      },
    ]);

    return result[0]?.total || 0;
  }
// 2. Downline portfolio Investment
  async getDownlinePortfolioInvestment(sponsor_id: string): Promise<number> {
    const downlineUsers = await this.getAllDownlineUsers(sponsor_id);
    const userIds = downlineUsers.map((u) => u.sponsor_id.toString());

    const result = await this.paymentOptionModel.aggregate([
      { $match: { sponsor_id: { $in: userIds } } },
      {
        $group: { _id: null, total: { $sum: { $toDouble: "$demat_amount" } } },
      },
    ]);

    return result[0]?.total || 0;
  }

  // 1. Direct team count
  async getDirectTeamCount(sponsor_id: string): Promise<number> {
    const directUsers = await this.userModel.countDocuments({
      referred_by: sponsor_id,
    });
    return directUsers;
  }

  // 2. Downline team count
  async getTotalDownlineTeamCount(sponsor_id: string): Promise<number> {
    const downlineUsers = await this.getAllDownlineUsers(sponsor_id);
    return downlineUsers.length;
  }
  
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
      status: "success",
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
      const users = await this.userModel
        .find({
          referred_by: { $in: currentSponsors },
        })
        .exec();

      const firstLevelSponsorIDs = users.map((user) => user.sponsor_id);

      const secondLevelUsers = await this.userModel
        .find({
          referred_by: { $in: firstLevelSponsorIDs },
        })
        .exec();

      const levelIncome = secondLevelUsers.reduce((sum, user) => {
        const packageAmount = parseFloat(String(user.package)) || 0;
        const income = (packageAmount * REFERRAL_PERCENTAGES[level]) / 100;
        return sum + income;
      }, 0);

      totalIncome += levelIncome;

      currentSponsors = secondLevelUsers.map((user) => user.sponsor_id);
      level++;
    }

    return  {
        total_income: totalIncome,
        level_income: level
      };
  }

   async getAllDownlineUsers(sponsor_id: string): Promise<any> {
    let downline: User[] = [];
  
    const directReferrals = await this.userModel.find({
      referred_by: sponsor_id,
    }).lean();
  
    const directSponsorIds = directReferrals.map(user => user.sponsor_id);
  
    let nextSponsorIds = [...directSponsorIds];
  
    while (nextSponsorIds.length > 0) {
      const users = await this.userModel.find({
        referred_by: { $in: nextSponsorIds },
      }).lean();
  
      downline = downline.concat(users);
      nextSponsorIds = users.map((user) => user.sponsor_id);
    }
  
    return downline;
  }   

  async getRankIncome(sponsor_id: string): Promise<any> {
    const downlineUsers = await this.getAllDownlineUsers(sponsor_id);
  
    const aiRobotBusiness = downlineUsers.reduce((sum, user) => {
      return sum + (user.package ? Number(user.package) : 0);
    }, 0);
  
    if (aiRobotBusiness < 2000) {
      return { rank: null, income: 0, aiRobotBusiness };
    }
  
    // Step 1: Count how many direct referrals qualify at each MASTER level
    const downlineMasterRanks = await Promise.all(
      downlineUsers.map(async (user) => {
        return {
          sponsor_id: user.sponsor_id,
          rank: await this.getUserMasterRank(user.sponsor_id),
        };
      })
    );
  
    const countByRank = downlineMasterRanks.reduce((acc, u) => {
      if (u.rank) acc[u.rank] = (acc[u.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    // Step 2: Determine highest MASTER level this sponsor qualifies for
    const masterRanks = [
      { rank: 'M1', required: 3, royalty: 0.25 },
      { rank: 'M2', required: 3, royalty: 0.25 },
      { rank: 'M3', required: 4, royalty: 0.15 },
      { rank: 'M4', required: 5, royalty: 0.10 },
      { rank: 'M5', required: 6, royalty: 0.10 },
      { rank: 'M6', required: 7, royalty: 0.10 },
      { rank: 'M7', required: 0, royalty: 0.05 },
    ];
  
    let qualifiedRank: string | null = null;
    let royaltyPercent = 0;
  
    for (let i = masterRanks.length - 1; i >= 0; i--) {
      const { rank, required, royalty } = masterRanks[i];
      if (rank === 'M7' || (countByRank[rank] || 0) >= required) {
        qualifiedRank = rank;
        royaltyPercent = royalty;
        break;
      }
    }
  
    const totalRoyalty = aiRobotBusiness * 0.10 * royaltyPercent;
  
    return {
      aiRobotBusiness,
      rank: qualifiedRank,
      royaltyPercent,
      income: totalRoyalty,
    };
  }  

  async getUserMasterRank(sponsor_id: string): Promise<string | null> {
    const downlineUsers = await this.getAllDownlineUsers(sponsor_id);
  
    const aiRobotBusiness = downlineUsers.reduce((sum, user) => {
      return sum + (user.package ? Number(user.package) : 0);
    }, 0);
  
    if (aiRobotBusiness < 2000) return null;
  
    const downlineMasterRanks = await Promise.all(
      downlineUsers.map(async (user) => {
        return {
          sponsor_id: user.sponsor_id,
          rank: await this.getUserMasterRank(user.sponsor_id),
        };
      })
    );
  
    const countByRank = downlineMasterRanks.reduce((acc, u) => {
      if (u.rank) acc[u.rank] = (acc[u.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    const masterRanks = [
      { rank: 'M1', required: 3 },
      { rank: 'M2', required: 3 },
      { rank: 'M3', required: 4 },
      { rank: 'M4', required: 5 },
      { rank: 'M5', required: 6 },
      { rank: 'M6', required: 7 },
      { rank: 'M7', required: 0 },
    ];
  
    for (let i = masterRanks.length - 1; i >= 0; i--) {
      const { rank, required } = masterRanks[i];
      if (rank === 'M7' || (countByRank[rank] || 0) >= required) {
        return rank;
      }
    }
  
    return null;
  }  
}
