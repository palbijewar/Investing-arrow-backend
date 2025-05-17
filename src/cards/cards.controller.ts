import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CardsService } from "./cards.service";

@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get("payment-count")
  @UseGuards(AuthGuard("jwt"))
  async getPaymentCount(@Req() req) {
    const sponsor_id = req.user.sponsor_id;

    const total = await this.cardsService.getTotalPaymentsBySponsor(sponsor_id);

    return {
      status: "success",
      data: {
        sponsor_id,
        total_payment_options: total,
      },
    };
  }

  @Get("total-fund")
  @UseGuards(AuthGuard("jwt"))
  async getTotalDematAmount(@Req() req) {
    const sponsor_id = req.user.sponsor_id;
    const total = await this.cardsService.getTotalDematAmountFund(sponsor_id);
    return {
      status: "success",
      data: {
        total_demat_amount: total,
      },
    };
  }

  @Get("referred-income/:sponsor_id")
  @UseGuards(AuthGuard("jwt"))
  async getReferredSponsorsTotalIncome(@Req() req) {
    const sponsor_id = req.user.sponsor_id;
    const total =
      await this.cardsService.getReferredSponsorsTotalIncome(sponsor_id);
    return total;
  }

  @Get("second-level-income/:sponsorId")
  async getSecondLevelReferralsTotalIncome(@Param("sponsorId") sponsorId: string) {
    const total = await this.cardsService.getSecondLevelReferralsTotalIncome(sponsorId);
    return { status: "success", data: total };
  }

  @Get("team/direct-bot/:sponsorId")
  async getDirectbotCount(@Param("sponsorId") sponsorId: string) {
    const total = await this.cardsService.getDirectbotCount(sponsorId);
    return { status: "success", data: { direct_bot_count: total } };
  }

  @Get("team/downline-bot/:sponsorId")
  async getActiveDownlineUsers(@Param("sponsorId") sponsorId: string) {
    const total = await this.cardsService.getActiveDownlineUsers(sponsorId);
    
    return { status: "success", data: { downline_bot_count: total.length } };
  }

  @Get('bot-direct/:sponsor_id')
  async botDirectPortfolioInvestment(@Param('sponsor_id') sponsor_id: string) {
    const total = await this.cardsService.botDirectPortfolioInvestment(sponsor_id);
    return {
      status: 'success',
      data: {
        direct_bot_income: total,
      },
    };
  }

  @Get('bot-downline/:sponsor_id')
  async botDownlinePortfolioInvestment(@Param('sponsor_id') sponsor_id: string) {    
    const total = await this.cardsService.botDownlinePortfolioInvestment(sponsor_id);
    return {
      status: 'success',
      data: {
        downline_bot_income: total,
      },
    };
  }

  @Get('direct-portfolio-investment/:sponsor_id')
  async directPortfolioInvestment(@Param('sponsor_id') sponsor_id: string) {
    const total = await this.cardsService.directPortfolioInvestment(sponsor_id);
    return {
      status: 'success',
      data: {
        direct_portfolio_investment: total,
      },
    };
  }

  @Get('downline-portfolio-investment/:sponsor_id')
  async getDownlinePortfolioInvestment(@Param('sponsor_id') sponsor_id: string) {    
    const total = await this.cardsService.getDownlinePortfolioInvestment(sponsor_id);
    return {
      status: 'success',
      data: {
        downline_portfolio_investment: total,
      },
    };
  }

  @Get("team/direct/:sponsorId")
  async getDirectTeam(@Param("sponsorId") sponsorId: string) {
    const count = await this.cardsService.getDirectTeamCount(sponsorId);
    return { status: "success", data: { count } };
  }

  @Get("team/downline/:sponsorId")
  async getDownlineTeam(@Param("sponsorId") sponsorId: string) {
    const count = await this.cardsService.getTotalDownlineTeamCount(sponsorId);
    return { status: "success", data: { count } };
  }
}
