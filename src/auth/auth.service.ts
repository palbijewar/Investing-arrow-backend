import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { sponsor_id, username, email, password, confirm_password } = dto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(password, 10);
    await this.usersService.create({
      sponsor_id,
      username,
      email,
      password: hash,
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
}
