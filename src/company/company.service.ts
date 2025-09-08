import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: data.name,
        profileImage:
          data.profileImage ??
          'https://images.pexels.com/photos/63324/california-road-highway-mountains-63324.jpeg',
        plan: data.plan ?? 'largeFleet',
        tier: data.tier ?? 'basic',
        subscriptionStatus: data.subscriptionStatus ?? 'trial',
        subscriptionEnds: data.subscriptionEnds ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // default 30-day trial
        billingEmail: data.billingEmail,
        maxUsers: data.maxUsers ?? 10,
        maxVehicles: data.maxVehicles ?? 20,
      },
    });
  };

  async getComapnyById(companyId: string){
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });

    if (!company){
      throw new NotFoundException('Company not found');
    };
    
    return company;
  };
};
