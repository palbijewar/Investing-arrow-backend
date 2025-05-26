import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";
import { MailService } from "./mail.service";
import { PaymentOption } from "src/payment-options/payment-options.schema";
import { GasWallet } from "src/gaswallet/GasWallet.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailService: MailService,
    @InjectModel(PaymentOption.name)
    private readonly paymentOptionModel: Model<PaymentOption>,
    @InjectModel(PaymentOption.name)
    private readonly gasWalletModel: Model<GasWallet>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findBySponsorID(sponsor_id: string) {
    return this.userModel.findOne({ sponsor_id }).exec();
  }

  async getSponsorDetails(sponsor_id: string): Promise<User | null> {
    return this.userModel.findOne({ sponsor_id }).exec();
  }

  async create(data: {
    sponsor_id: string;
    referred_by: string;
    username: string;
    email: string;
    password: string;
    phone: string;
  }) {
    const newUser = new this.userModel(data);
    const savedUser = await newUser.save();

    await this.mailService.sendWelcomeEmail(
      savedUser.email,
      savedUser.username,
      savedUser.sponsor_id,
    );

    return savedUser;
  }

  async getSponsorName(sponsor_id: string): Promise<string | null> {
    const sponsor = await this.userModel.findOne({ sponsor_id }).exec();
    return sponsor ? sponsor.username : null;
  }

  async getReferredSponsors(sponsor_id: string): Promise<any[]> {
    const referredUsers = await this.userModel
      .find({ referred_by: sponsor_id })
      .sort({ createdAt: -1 })
      .exec();

    const enrichedUsers = await Promise.all(
      referredUsers.map(async (user) => {
        const paymentOption = await this.paymentOptionModel.findOne({
          sponsor_id: user.sponsor_id,
        });

        return {
          ...user.toObject(),
          amount_deposited: paymentOption?.amount || null,
        };
      }),
    );

    return enrichedUsers;
  }

  async getAllLowerLevelReferrals(sponsor_id: string): Promise<any[]> {
    await this.getReferralLevels(sponsor_id, 10);
    const result: any[] = [];
    const visitedSponsorIds = new Set<string>();
    let currentLevelSponsorIds = [sponsor_id];
    let level = 1;

    while (currentLevelSponsorIds.length > 0) {
      const nextLevelSponsorIds: string[] = [];

      const users = await this.userModel
        .find({ referred_by: { $in: currentLevelSponsorIds } })
        .exec();

      for (const user of users) {
        if (visitedSponsorIds.has(user.sponsor_id)) continue;

        visitedSponsorIds.add(user.sponsor_id);

        if (level > 1) {
          // Fetch referral username
          const referralUser = await this.userModel.findOne({
            sponsor_id: user.referred_by,
          });

          // Fetch payment option
          const paymentOption = await this.paymentOptionModel.findOne({
            sponsor_id: user.sponsor_id,
          });

          result.push({
            registration_date: user.createdAt,
            sponsor_id: user.sponsor_id,
            sponsor_name: user.username,
            referral_id: user.referred_by,
            referral_username: referralUser?.username || "",
            amount_deposited: paymentOption?.amount || null,
            package: user?.package || null,
            level: level,
            createdAt: user.createdAt,
          });
        }

        nextLevelSponsorIds.push(user.sponsor_id);
      }

      currentLevelSponsorIds = nextLevelSponsorIds;
      level++;
    }

    return result;
  }

  async updateProfile(
    sponsorId: string,
    updateData: {
      username?: string;
      email?: string;
      phone?: string;
    },
  ): Promise<any> {
    const updatedSponsor = await this.userModel
      .findOneAndUpdate(
        { sponsor_id: sponsorId },
        { $set: updateData },
        { new: true },
      )
      .exec();
    return {
      status: "success",
      data: updatedSponsor,
    };
  }

  async setUserActivation(
    sponsor_id: string,
    isActive: boolean,
  ): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { sponsor_id },
      { $set: { is_active: isActive } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException(
        `User with sponsor_id ${sponsor_id} not found`,
      );
    }

    return user;
  }

  async getAllSponsors(is_active?: boolean): Promise<any[]> {
    const query = typeof is_active === 'boolean' ? { is_active } : {};
  
    const sponsors = await this.userModel.find(query).exec();
    
    const enrichedSponsors = await Promise.all(
      sponsors.map(async (sponsor) => {
        const [paymentOption, gaswallet] = await Promise.all([
          this.paymentOptionModel.findOne({ sponsor_id: sponsor.sponsor_id }),
          this.gasWalletModel.findOne({ sponsor_id: sponsor.sponsor_id }),
        ]);
  console.log({paymentOption});
  console.log({gaswallet});
  
        return {
          ...sponsor.toObject(),
          demat_amount: paymentOption?.demat_amount || null,
          amount_deposited: paymentOption?.amount || null,
          gas_wallet_fees: gaswallet?.gas_wallet_amount || null,
        };
      }),
    );
  
    return enrichedSponsors;
  }  

  async updateAmountDeposited(
    sponsor_id: string,
    newAmount: any,
  ): Promise<any> {
    const user = await this.userModel.findOne({ sponsor_id });
    if (!user) {
      throw new Error(`User with sponsor_id ${sponsor_id} not found`);
    }
    const updatedAmount = Number(newAmount);

    await this.userModel.updateOne(
      { sponsor_id },
      { $set: { amount_deposited: updatedAmount.toString() } },
    );

    const updatedUser = await this.userModel.findOne({ sponsor_id });

    return {
      status: "success",
      message: "Amount deposited updated successfully",
      data: updatedUser,
    };
  }

  async updatePackage(sponsor_id: string, newPackage: any): Promise<any> {
    const user = await this.userModel.findOne({ sponsor_id });
    if (!user) {
      throw new Error("User with sponsor_id ${sponsor_id} not found");
    }

    await this.userModel.updateOne(
      { sponsor_id },
      { $set: { package: newPackage.toString() } },
    );

    const updatedUser = await this.userModel.findOne({ sponsor_id });

    return {
      status: "success",
      message: "Package updated successfully",
      data: updatedUser,
    };
  }

  async getReferralLevels(
    sponsor_id: string,
    maxLevel: number = 10,
  ): Promise<any> {
    const levels: Record<number, any[]> = {};
    let currentLevelSponsorIds: string[] = [sponsor_id];

    for (let level = 1; level <= maxLevel; level++) {
      const users = await this.userModel
        .find({
          referred_by: { $in: currentLevelSponsorIds },
        })
        .exec();

      if (users.length === 0) break;

      // Update each user's level field in DB
      for (const user of users) {
        await this.userModel.updateOne(
          { sponsor_id: user.sponsor_id },
          { $set: { level } },
        );
      }

      levels[level] = users.map((user) => ({
        level,
        registration_date: user.createdAt,
        sponsor_id: user.sponsor_id,
        referral_id: user.referred_by,
        username: user.username,
        package: user.package,
        is_active: user.is_active,
      }));

      // Prepare for next level
      currentLevelSponsorIds = users.map((u) => u.sponsor_id);
    }

    return levels;
  }

  async calculateSponsorChainLevelIncome(sponsor_id: string, amount: number) {
    const userlist = await this.getReferralLevels(sponsor_id);
    const percentages = [25, 17, 12, 10, 8, 7, 6, 5, 5, 5];

    const allUsers: any[] = Object.values(userlist).flat();
    const incomeMap = new Map<
      string,
      Map<
        number,
        {
          sponsor_id: string;
          sponsor_name: string;
          percentage: string;
          income: number;
        }
      >
    >();

    const processed = new Set<string>();

    for (const user of allUsers) {
      if (processed.has(user.sponsor_id)) continue;

      let currentSponsorId = user.referral_id;
      let level = 1;

      while (currentSponsorId && level <= percentages.length) {
        const sponsor = await this.userModel
          .findOne({ sponsor_id: currentSponsorId })
          .exec();
        if (!sponsor) break;

        const income = (amount * percentages[level - 1]) / 100;

        if (!incomeMap.has(currentSponsorId)) {
          incomeMap.set(currentSponsorId, new Map());
        }

        const levelMap = incomeMap.get(currentSponsorId)!;

        if (!levelMap.has(level)) {
          levelMap.set(level, {
            sponsor_id: currentSponsorId,
            sponsor_name: sponsor.username,
            percentage: `${percentages[level - 1]}%`,
            income: 0,
          });
        }

        levelMap.get(level)!.income += income;

        currentSponsorId = sponsor.referred_by;
        level++;
      }

      processed.add(user.sponsor_id);
    }

    const breakdown = Array.from(incomeMap.values()).flatMap((levelMap) =>
      Array.from(levelMap.entries()).map(([level, data]) => ({
        level,
        ...data,
      })),
    );

    const direct_income = (amount * 25) / 100;
    const downline_income = amount - direct_income;

    return {
      amount,
      direct_income,
      downline_income,
      breakdown,
    };
  }

  async calculateTotalSponsorProfit(sponsor_id: string): Promise<any> {
    // 1. Get Level 1 sponsors (direct)
    const level1Sponsors = await this.userModel
      .find({ referred_by: sponsor_id })
      .exec();

    const directProfit = level1Sponsors.reduce((sum, user) => {
      return sum + (parseFloat(String(user.profit ?? "0")) || 0);
    }, 0);

    // 2. Get all downline sponsors beyond Level 1
    const allDownlines = await this.getAllLowerLevelReferrals(sponsor_id); // already skips level 1

    const sponsorIds = allDownlines.map((s) => s.sponsor_id);

    const downlineUsers = await this.userModel
      .find({ sponsor_id: { $in: sponsorIds } })
      .exec();

    const downlineProfit = downlineUsers.reduce((sum, user) => {
      return sum + (parseFloat(String(user.profit ?? "0")) || 0);
    }, 0);

    return {
      sponsor_id,
      direct_profit: directProfit,
      downline_profit: downlineProfit,
      total_profit: directProfit + downlineProfit,
      total_direct_sponsors: level1Sponsors.length,
      total_downline_sponsors: downlineUsers.length,
    };
  }

  async updateProfit(sponsor_id: string, totalProfit: number): Promise<any> {
    const user = await this.userModel.findOne({ sponsor_id });
    if (!user) {
      throw new Error(`User with sponsor_id ${sponsor_id} not found`);
    }
  
    const profitShare = (totalProfit * 15) / 100;
  
    const selfProfit = (profitShare * 25) / 100;
    const newProfit = (user.profit || 0) + selfProfit;
  
    await this.userModel.updateOne(
      { sponsor_id },
      { $set: { profit: newProfit } },
    );
  
    const remainingProfit = profitShare - selfProfit;
    const distributionResult = await this.distributeLevelWiseProfit(
      sponsor_id,
      remainingProfit,
    );
  
    const updatedUser = await this.userModel.findOne({ sponsor_id });
  
    return {
      status: "success",
      message: "Profit updated and distributed successfully",
      selfProfit: selfProfit,
      distributedProfit: distributionResult,
      updatedUser,
    };
  }  

  async getLevelWiseProfitDistribution(sponsor_id: string): Promise<any> {
    const mainUser = await this.userModel.findOne({ sponsor_id }).exec();

    if (!mainUser) {
      throw new NotFoundException(
        `User not found for sponsor_id ${sponsor_id}`,
      );
    }

    const maxLevels = 10;
    const levelDistribution: Record<number, any[]> = {};
    const percentages = [25, 17, 12, 10, 8, 7, 6, 5, 5, 5]; // Level-wise %

    let currentLevelSponsorIds = [sponsor_id];
    let totalProfit = 0;

    for (let level = 1; level <= maxLevels; level++) {
      const users = await this.userModel.find({
        referred_by: { $in: currentLevelSponsorIds },
      });

      if (users.length === 0) break;

      levelDistribution[level] = [];
      const levelPercent = percentages[level - 1] ?? 0;

      for (const user of users) {
        const userProfit = parseFloat(String(user.profit ?? "0"));
        const calculatedProfit = userProfit * (levelPercent / 100);

        totalProfit += calculatedProfit;

        levelDistribution[level].push({
          sponsor_id: user.sponsor_id,
          sponsor_name: user.username,
          level,
          actual_profit: userProfit,
          profit: parseFloat(calculatedProfit.toFixed(2)), // ✅ Here's the calculated profit
        });
      }

      currentLevelSponsorIds = users.map((u) => u.sponsor_id);
    }

    return {
      sponsor_id,
      total_profit: parseFloat(totalProfit.toFixed(2)),
      distribution: levelDistribution,
    };
  }

  async getProfitSummary(sponsor_id: string): Promise<any> {
    const user = await this.userModel.findOne({ sponsor_id }).exec();
    if (!user) {
      throw new NotFoundException(
        `User with sponsor_id ${sponsor_id} not found`,
      );
    }

    const levelWiseDistribution =
      await this.getLevelWiseProfitDistribution(sponsor_id);

    let directActualProfit = 0;
    let downlineActualProfit = 0;
    let directPercentageProfit = 0;
    let downlinePercentageProfit = 0;

    for (const level in levelWiseDistribution.distribution) {
      const entries = levelWiseDistribution.distribution[level];

      for (const entry of entries) {
        const actualProfit = parseFloat(entry.actual_profit || "0");
        // Here 'profit' in your distribution is the percentage-based profit
        const percentageProfit = parseFloat(entry.profit || "0");

        if (Number(level) === 1) {
          directActualProfit += actualProfit;
          directPercentageProfit += percentageProfit;
        } else {
          downlineActualProfit += actualProfit;
          downlinePercentageProfit += percentageProfit;
        }
      }
    }

    return {
      sponsor_id,
      direct_actual_profit: directActualProfit,
      downline_actual_profit: downlineActualProfit,
      direct_percentage_profit: directPercentageProfit,
      downline_percentage_profit: downlinePercentageProfit,
    };
  }

  async deleteSponsor(sponsor_id: string): Promise<any> {
    const user = await this.userModel.findOne({ sponsor_id });

    if (!user) {
      throw new NotFoundException(
        `User with sponsor_id ${sponsor_id} not found`,
      );
    }

    // Optional: Check if the sponsor has any referrals
    const hasReferrals = await this.userModel.exists({
      referred_by: sponsor_id,
    });
    if (hasReferrals) {
      return {
        status: "failed",
        message: `Cannot delete sponsor ${sponsor_id} because they have referrals.`,
      };
    }

    await this.userModel.deleteOne({ sponsor_id });

    return {
      status: "success",
      message: `Sponsor with sponsor_id ${sponsor_id} has been deleted.`,
    };
  }

  async distributeLevelWiseProfit(userSponsorId: string, totalProfit: number) {
    const directUsers = await this.getReferredSponsors(userSponsorId);
    const downlineUsers = await this.getAllLowerLevelReferrals(userSponsorId);

    const LEVEL_PERCENTAGES = [25, 17, 12, 10, 8, 7, 6, 5, 5, 5]; // Level 1–10

    const distributedProfits: {
      level: number;
      sponsor_id: string;
      username: string;
      email: string;
      phone: string;
      profit: number;
    }[] = [];

    let totalDirectIncome = 0;
    let totalDownlineIncome = 0;

    // ✅ Level 1 - direct users
    const directSponsorMap = new Map<string, boolean>();
    for (const user of directUsers) {
      const level = 1;
      const sponsorId = user.sponsor_id;

      if (directSponsorMap.has(sponsorId)) continue;
      directSponsorMap.set(sponsorId, true);

      const sponsor = await this.userModel.findOne({ sponsor_id: sponsorId });
      if (!sponsor) continue;

      const levelProfit = (totalProfit * LEVEL_PERCENTAGES[level - 1]) / 100;
      await this.addProfitToSponsor(sponsor.sponsor_id, levelProfit);

      totalDirectIncome += levelProfit;

      distributedProfits.push({
        level,
        sponsor_id: sponsor.sponsor_id,
        username: sponsor.username,
        email: sponsor.email,
        phone: sponsor.phone,
        profit: levelProfit,
      });
    }

    // ✅ Level 2–10 - downline users
    for (const user of downlineUsers) {
      const level = user.level;
      if (level < 2 || level > 10) continue;

      const sponsor = await this.userModel.findOne({
        sponsor_id: user.sponsor_id,
      });
      if (!sponsor) continue;

      const levelProfit = (totalProfit * LEVEL_PERCENTAGES[level - 1]) / 100;
      await this.addProfitToSponsor(sponsor.sponsor_id, levelProfit);

      totalDownlineIncome += levelProfit;

      distributedProfits.push({
        level,
        sponsor_id: sponsor.sponsor_id,
        username: sponsor.username,
        email: sponsor.email,
        phone: sponsor.phone,
        profit: levelProfit,
      });
    }

    return {
      message: "Profit successfully distributed across levels",
      totalDistributed: totalProfit,
      totalDirectIncome,
      totalDownlineIncome,
      distributedProfits,
    };
  }

  async addProfitToSponsor(sponsor_id: string, amount: number) {
    await this.userModel.updateOne(
      { sponsor_id },
      { $inc: { profit: amount } },
    );
  }

  async getLevelWiseProfit(userSponsorId: string): Promise<{
    message: string;
    totalDirectIncome: number;
    totalDownlineIncome: number;
    totalIncome: number;
  }> {
    const directUsers = await this.getReferredSponsors(userSponsorId);
    const downlineUsers = await this.getAllLowerLevelReferrals(userSponsorId);

    let totalDirectIncome = 0;
    let totalDownlineIncome = 0;
    let totalIncome = 0;

    const directSponsorMap = new Map<string, boolean>();
    const downlineSponsorMap = new Map<string, boolean>();

    // ✅ Level 1 - Direct users
    for (const user of directUsers) {
      const sponsorId = user.sponsor_id;
      if (directSponsorMap.has(sponsorId)) continue;

      directSponsorMap.set(sponsorId, true);

      const sponsor = await this.userModel.findOne({ sponsor_id: sponsorId });
      if (!sponsor) continue;

      const levelProfit = sponsor.profit || 0;
      totalDirectIncome += levelProfit;
    }

    // ✅ Levels 2–10 - Downline users
    for (const user of downlineUsers) {
      const level = user.level;
      const sponsorId = user.sponsor_id;
      if (level < 2 || level > 10) continue;
      if (downlineSponsorMap.has(sponsorId)) continue;

      downlineSponsorMap.set(sponsorId, true);

      const sponsor = await this.userModel.findOne({ sponsor_id: sponsorId });
      if (!sponsor) continue;

      const levelProfit = sponsor.profit || 0;
      totalDownlineIncome += levelProfit;
    }
    totalIncome = totalDirectIncome + totalDownlineIncome;
    return {
      message: "Profit summary calculated successfully",
      totalDirectIncome,
      totalDownlineIncome,
      totalIncome,
    };
  }
}
