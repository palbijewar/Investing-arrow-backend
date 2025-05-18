import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import { InjectModel } from "@nestjs/mongoose";
import { BrokerDto } from "./dto/broker-details.dto";
import { Model } from "mongoose";
import { Broker } from "./broker-details.schema";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class BrokerService {
  constructor(
    @InjectModel(Broker.name) private brokerModel: Model<Broker>,
    private readonly authService: AuthService,
  ) {}

  async create(brokerDto: BrokerDto, sponsor_id: string): Promise<any> {
    const broker = new this.brokerModel({ ...brokerDto, sponsor_id });
    await broker.save();
    return { status: "success", data: broker };
  }

  async findAll(sponsor_id: string): Promise<any> {
    const brokers = await this.brokerModel.find({ sponsor_id }).exec();
    return { status: "success", data: brokers };
  }

  async getAllBrokersWithSponsorNames(): Promise<any> {
    try {
      const sponsorIds = await this.brokerModel.distinct("sponsor_id").exec();

      const results = await Promise.all(
        sponsorIds.map(async (sponsor_id) => {
          try {
            const sponsorName = await this.authService.getSponsorName(sponsor_id);

            const brokers = await this.brokerModel.find({ sponsor_id }).exec();

            return {
              sponsor_id,
              sponsor_name: sponsorName.data.username,
              brokers,
            };
          } catch (err) {
            return {
              sponsor_id,
              sponsor_name: "Unknown (Failed to fetch from Firebase)",
              brokers: [],
              error: err.message,
            };
          }
        }),
      );

      return { status: "success", data: results };
    } catch (error) {
      return { status: "error", message: "Something went wrong", error };
    }
  }
}
