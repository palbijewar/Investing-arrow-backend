import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { BrokerService } from './broker-details.service';
import { BrokerDto } from './dto/broker-details.dto';

@Controller('broker-details')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Post()
  async create(@Body() brokerDto: BrokerDto) {
    return this.brokerService.create(brokerDto);
  }

  @Get()
  async getAll() {
    return this.brokerService.findAll();
  }
}

