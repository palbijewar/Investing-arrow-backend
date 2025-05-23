import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  Patch,
  Delete,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgotpass.dto";
import {
  ActivateUserDto,
  UpdateDepositDto,
  UpdateUserDto,
} from "./dto/updateUser.dto";
import { UsersService } from "src/users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post("signup")
  async signup(@Body() signupDto: SignupDto) {
    console.log("Received DTO:", signupDto);
    return this.authService.signup(signupDto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("sponsors/:sponsor_id")
  async getSponsorName(@Param("sponsor_id") sponsor_id: string) {
    const sponsorName = await this.authService.getSponsorName(sponsor_id);
    return sponsorName;
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Get("referrals/:sponsor_id")
  getReferredSponsors(@Param("sponsor_id") sponsor_id: string) {
    return this.authService.getReferredSponsors(sponsor_id);
  }

  @Get("referrals/second-level/:sponsor_id")
  getSecondLevelReferrals(@Param("sponsor_id") sponsor_id: string) {
    return this.authService.getSecondLevelReferrals(sponsor_id);
  }

  @Get("sponsor-details/:sponsor_id")
  getSponsorDetails(@Param("sponsor_id") sponsor_id: string) {
    return this.authService.getSponsorDetails(sponsor_id);
  }

  @Put("users/:sponsor_id")
  async updateProfile(
    @Param("sponsor_id") sponsorId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      sponsorId,
      updateDto,
    );
    return { updatedUser };
  }

  @Patch("activate/:sponsor_id")
  async toggleUserActivation(
    @Param("sponsor_id") sponsorId: string,
    @Body() dto: ActivateUserDto,
  ) {
    const updatedUser = await this.usersService.setUserActivation(
      sponsorId,
      dto.is_active,
    );
    return {
      status: "success",
      message: `User ${sponsorId} ${dto.is_active ? "activated" : "deactivated"}`,
      data: updatedUser,
    };
  }

  @Get("users")
  async getAllSponsors() {
    const sponsors = await this.usersService.getAllSponsors();
    return { status: "success", data: sponsors };
  }

  @Patch("package/:sponsor_id")
  async updatePackage(
    @Param("sponsor_id") sponsor_id: string,
    @Body() data: any,
  ) {
    const amount = data.package;

    return this.usersService.updatePackage(sponsor_id, amount);
  }

  @Patch("users/profit/:sponsor_id")
  async updateProfit(
    @Param("sponsor_id") sponsor_id: string,
    @Body() data: any,
  ) {
    const amount = data.profit;

    return this.usersService.updateProfit(sponsor_id, amount);
  }

  @Get("levels/:sponsor_id")
  async getReferralLevels(@Param("sponsor_id") sponsor_id: string) {
    const levels = await this.usersService.getReferralLevels(sponsor_id, 10);
    return { status: "success", data: levels };
  }

  @Get("level-income/:sponsor_id")
  async calculateSponsorChainLevelIncome(
    @Body() data: any,
    @Param("sponsor_id") sponsor_id: string,
  ) {
    const levels = await this.usersService.calculateSponsorChainLevelIncome(
      sponsor_id,
      data.amount,
    );
    return { status: "success", data: levels };
  }

  @Get("users/profit/:sponsor_id")
  async calculateTotalSponsorProfit(@Param("sponsor_id") sponsor_id: string) {
    const levels =
      await this.usersService.calculateTotalSponsorProfit(sponsor_id);
    return { status: "success", data: levels };
  }

  @Get("users/profit-distribution/:sponsor_id")
  async getProfitDistribution(@Param("sponsor_id") sponsor_id: string) {
    const levels =
      await this.usersService.getLevelWiseProfitDistribution(sponsor_id);
    return { status: "success", data: levels };
  }

  @Get("users/profit-summary/:sponsor_id")
  async getProfitSummary(@Param("sponsor_id") sponsor_id: string) {
    const levels = await this.usersService.getProfitSummary(sponsor_id);
    return { status: "success", data: levels };
  }

  @Delete("users/sponsor/:sponsor_id")
  async deleteSponsor(@Param("sponsor_id") sponsor_id: string) {
    const res = await this.usersService.deleteSponsor(sponsor_id);
    return { status: "success", data: res };
  }

  @Post("users/distribute-profit/:sponsor_id")
  async handleDistributeProfit(
    @Param("sponsor_id") sponsor_id: string,
    @Body("profit") profit: string,
  ) {
    return this.usersService.distributeProfit(sponsor_id, profit);
  }
}
