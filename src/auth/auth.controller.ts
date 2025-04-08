import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotpass.dto';

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
  }

  @Post('forgot-password')
forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto);
}

@Get('referrals/:sponsor_id')
getReferredSponsors(@Param('sponsor_id') sponsor_id: string) {
  return this.authService.getReferredSponsors(sponsor_id);
}

@Get('referrals/second-level/:sponsor_id')
getSecondLevelReferrals(@Param('sponsor_id') sponsor_id: string) {
  return this.authService.getSecondLevelReferrals(sponsor_id);
}

@Get('sponsor-details/:sponsor_id')
getSponsorDetails(@Param('sponsor_id') sponsor_id: string) {
  return this.authService.getSponsorDetails(sponsor_id);
}
}
