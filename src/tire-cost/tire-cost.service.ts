import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTireCostDto } from './dto/create-tire-cost.dto';
import { subMonths, startOfMonth } from 'date-fns';

@Injectable()
export class TireCostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTireCostDto) {
    const tire = await this.prisma.tire.findUnique({ where: { id: dto.tireId } });
    if (!tire) throw new NotFoundException('Tire not found');

    return this.prisma.tireCost.create({
      data: {
        tireId: dto.tireId,
        value: dto.value,
        date: dto.date,
        supplier: dto.supplier,
      },
    });
  }

  async getCostsByTire(tireId: string) {
    return this.prisma.tireCost.findMany({
      where: { tireId },
      orderBy: { date: 'desc' },
    });
  }

  async getTotalCost(tireId: string) {
    const costs = await this.getCostsByTire(tireId);
    return costs.reduce((sum, cost) => sum + cost.value, 0);
  }

  async getMonthlyCompanyCost(companyId: string) {
  const tires = await this.prisma.tire.findMany({
    where: { companyId },
    select: { id: true },
  });

  const tireIds = tires.map(t => t.id);

  const now = new Date();
  const startCurrent = startOfMonth(now);
  const startPrevious = startOfMonth(subMonths(now, 1));

  // Get costs from this month
  const currentMonthCosts = await this.prisma.tireCost.findMany({
    where: {
      tireId: { in: tireIds },
      date: {
        gte: startCurrent,
      },
    },
  });

  // Get costs from previous month
  const previousMonthCosts = await this.prisma.tireCost.findMany({
    where: {
      tireId: { in: tireIds },
      date: {
        gte: startPrevious,
        lt: startCurrent,
      },
    },
  });

  const totalCurrent = currentMonthCosts.reduce((sum, c) => sum + c.value, 0);
  const totalPrevious = previousMonthCosts.reduce((sum, c) => sum + c.value, 0);

  return {
    currentMonthTotal: totalCurrent,
    previousMonthTotal: totalPrevious,
  };
}

async getTotalInvestmentByCompany(companyId: string) {
  // Get all tire IDs from the company
  const tires = await this.prisma.tire.findMany({
    where: { companyId },
    select: { id: true },
  });

  const tireIds = tires.map(t => t.id);
  if (tireIds.length === 0) return { totalInvestment: 0 };

  // Get all TireCosts and sum them
  const costs = await this.prisma.tireCost.findMany({
    where: { tireId: { in: tireIds } },
    select: { value: true },
  });

  const totalInvestment = costs.reduce((sum, cost) => sum + cost.value, 0);

  return { totalInvestment };
}


}
