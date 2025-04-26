import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgotpass.dto';
import * as admin from 'firebase-admin'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    // @Inject('FIREBASE_ADMIN') private firebase: admin.app.App
  ) {}

  async signup(dto: SignupDto) {
    const { sponsor_id, referred_by, username, email, phone, password, confirm_password } = dto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(password, 10);
    console.log('Creating user with data:', {
      sponsor_id,
      referred_by,
      username,
      email,
      phone,
      password: hash,
    });
    
    await this.usersService.create({
      sponsor_id,
      username,
      email,
      phone,
      password: hash,
      referred_by,
    });

    return { status:"success", message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    const { sponsor_id, password } = dto;

    const user = await this.usersService.findBySponsorID(sponsor_id);
    if (!user)
      throw new UnauthorizedException('Invalid sponsor ID or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      throw new UnauthorizedException('Invalid sponsor ID or password');

    const payload = { sub: user._id, sponsor_id: user.sponsor_id };
    const token = this.jwtService.sign(payload);

    return { status:"success",data:{access_token: token }};
  }

  async getSponsorName(sponsor_id: string): Promise<any> {
    const sponsor = await this.usersService.findBySponsorID(sponsor_id);
    if (!sponsor) {
      return { status: 'error', message: 'Sponsor not found' };
    }
  
    return {
      status: 'success',
      data: {
        sponsor_id: sponsor.sponsor_id,
        username: sponsor.username,
      },
    };
  }  

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;
  
    return {
      status: 'success',
      message: 'Password reset successful',
    };
  }  

  // async sendResetPasswordLink(email: string) {
  //   try {
  //     const link = await this.firebase.auth().generatePasswordResetLink(email);
  //     // You can either return the link or send it via email using nodemailer, etc.
  //     return { status: 'success', message: 'Password reset link sent', link };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async getReferredSponsors(sponsor_id: string) {
    const users = await this.usersService.getReferredSponsors(sponsor_id);
    return {
      status: 'success',
      count: users.length,
      data: users.map(user => ({
        sponsor_id: user.sponsor_id,
        username: user.username,
        package: user.package || '',
        createdAt: user.createdAt,
      })),
    };
  }  

  async getSecondLevelReferrals(sponsor_id: string) {
    const users = await this.usersService.getSecondLevelReferrals(sponsor_id);
  
    return {
      status: 'success',
      count: users.length,
      data: users.map(user => ({
        registration_date: user.registration_date,
        sponsor_id: user.sponsor_id,
        sponsor_name: user.sponsor_name,
        referral_id: user.referral_id,
        referral_username: user.referral_username,
        package: user.package || '',
        level: user.level || '',
      })),
    };
  }  

  async getSponsorDetails(sponsor_id: string) {
    const sponsor = await this.usersService.getSponsorDetails(sponsor_id);
    if (!sponsor) {
      return { status: 'error', message: 'Sponsor not found' };
    }
  
    return {
      status: 'success',
      data: {
        sponsor_id: sponsor.sponsor_id,
        username: sponsor.username,
        email: sponsor.email,
        phone: sponsor.phone,
        referred_by: sponsor.referred_by,
      },
    };
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
    const users = await this.usersService.getSecondLevelReferrals(sponsor_id);
  
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
}
