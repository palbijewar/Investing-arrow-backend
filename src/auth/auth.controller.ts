import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('sponsors/:sponsor_id')
  async getSponsorName(@Param('sponsor_id') sponsor_id: string) {
    const sponsorName = await this.authService.getSponsorName(sponsor_id);
    return sponsorName
      ? { sponsor_id, sponsorName }
      : { message: 'Sponsor not found' };
  }
}
