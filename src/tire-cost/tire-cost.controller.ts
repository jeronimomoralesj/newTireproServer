import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TireCostService } from './tire-cost.service';
import { CreateTireCostDto } from './dto/create-tire-cost.dto';

@Controller('tire-cost')
export class TireCostController {
  constructor(private readonly service: TireCostService) {}

  @Post('create')
  async create(@Body() dto: CreateTireCostDto) {
    return this.service.create(dto);
  }

  @Get('by-tire/:tireId')
  async getByTire(@Param('tireId') tireId: string) {
    return this.service.getCostsByTire(tireId);
  }

  @Get('total/:tireId')
  async getTotalCost(@Param('tireId') tireId: string) {
    return { totalCost: await this.service.getTotalCost(tireId) };
  }

  @Get('monthly/by-company/:companyId')
  async getMonthlyCosts(@Param('companyId') companyId: string) {
    return this.service.getMonthlyCompanyCost(companyId);
  }

  @Get('total/by-company/:companyId')
  async getTotalInvestmentByCompany(@Param('companyId') companyId: string) {
    return this.service.getTotalInvestmentByCompany(companyId);
  }
}
