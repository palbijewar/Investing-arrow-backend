import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
  }) {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async getSponsorName(sponsor_id: string): Promise<string | null> {
    const sponsor = await this.userModel.findOne({ sponsor_id }).exec();
    return sponsor ? sponsor.username : null;
  }  

  async getReferredSponsors(sponsor_id: string): Promise<User[]> {
    return this.userModel.find({ referred_by: sponsor_id }).exec();
  }  

  async getSecondLevelReferrals(sponsor_id: string): Promise<User[]> {
    // First level referrals
    const firstLevelUsers = await this.userModel.find({ referred_by: sponsor_id }).exec();
    const firstLevelSponsorIDs = firstLevelUsers.map(user => user.sponsor_id);
  
    // Second level referrals
    return this.userModel.find({ referred_by: { $in: firstLevelSponsorIDs } }).exec();
  }  
}
