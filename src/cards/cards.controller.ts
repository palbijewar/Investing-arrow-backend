import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('payment-count')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentCount(@Req() req) {
    const sponsor_id = req.user.sponsor_id;

    const total = await this.cardsService.getTotalPaymentsBySponsor(sponsor_id);

    return {
      status: 'success',
      data: {
        sponsor_id,
        total_payment_options: total
      }
    };
  }

   @Get('total-fund')
   @UseGuards(AuthGuard('jwt'))
  async getTotalDematAmount(@Req() req) {
    const sponsor_id = req.user.sponsor_id;
    const total = await this.cardsService.getTotalDematAmountFund(sponsor_id);
    return {
      status: 'success',
      data: {
        total_demat_amount: total,
      }
    };
  }

  @Get('referred-income/:sponsor_id')
  @UseGuards(AuthGuard('jwt'))
 async getReferredSponsorsTotalIncome(@Req() req) {
   const sponsor_id = req.user.sponsor_id;
   const total = await this.cardsService.getReferredSponsorsTotalIncome(sponsor_id);
   return total
 }

 @Get('second-level-income/:sponsor_id')
 @UseGuards(AuthGuard('jwt'))
async getSecondLevelReferralsTotalIncome(@Req() req) {
  const sponsor_id = req.user.sponsor_id;
  const total = await this.cardsService.getSecondLevelReferralsTotalIncome(sponsor_id);
  return total
}
}
