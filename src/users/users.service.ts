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

  async create(data: {
    sponsor_id: string;
    username: string;
    email: string;
    password: string;
  }) {
    const newUser = new this.userModel(data);
    return newUser.save();
  }
}
