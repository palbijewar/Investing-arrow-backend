import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { BrokerService } from './broker-details.service';
import { BrokerDto } from './dto/broker-details.dto';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Post('broker-details')
  async create(@Body() brokerDto: BrokerDto) {
    return this.brokerService.create(brokerDto);
  }

  @Get('broker-details')
  async getAll() {
    return this.brokerService.findAll();
  }
}

