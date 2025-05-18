import { Controller, Post, Body, Get, Query, Param } from "@nestjs/common";
import { BrokerService } from "./broker-details.service";
import { BrokerDto } from "./dto/broker-details.dto";

@Controller("broker-details")
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @Post(":sponsor_id")
  async create(
    @Body() brokerDto: BrokerDto,
    @Param("sponsor_id") sponsor_id: string,
  ) {
    return this.brokerService.create(brokerDto, sponsor_id);
  }

  @Get(":sponsor_id")
  async getAll(@Param("sponsor_id") sponsor_id: string) {
    return this.brokerService.findAll(sponsor_id);
  }

  @Get()
  async getAllBrokersWithSponsors() {
    return this.brokerService.getAllBrokersWithSponsorNames();
  }
}
