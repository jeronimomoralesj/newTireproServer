import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

 async create(dto: CreateIncomeDto, prismaClient?: Prisma.TransactionClient) {
  console.log('=== INCOME CREATION START ===');
  console.log('Income DTO received:', JSON.stringify(dto, null, 2));
  
  const client = prismaClient || this.prisma;
  
  try {
    // Create income WITHOUT userId and companyId to avoid foreign key constraints
    const createData = {
  tripId: dto.tripId ?? null, // ✅ Prisma wants null, not undefined
  amount: Number(dto.amount),
  title: dto.title,
  date: new Date(dto.date),
  companyPaying: dto.companyPaying ?? '',
  type: dto.type ?? '',
  note: dto.description || '',
  paymentStructure: dto.paymentStructure || {},
};
    
    console.log('Creating income with data (NO foreign keys):', JSON.stringify(createData, null, 2));
    
    const result = await client.income.create({
      data: createData,
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            date: true,
          }
        }
      }
    });
    
    console.log('=== INCOME CREATION SUCCESS ===');
    console.log('Final result:', {
      id: result.id,
      amount: result.amount,
      tripId: result.tripId
    });
    
    return result;
    
  } catch (error) {
    console.error('=== INCOME CREATION FAILED ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    throw error;
  }
}
  async findAll() {
    return this.prisma.income.findMany({
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            date: true,
          }
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.income.findMany({
      where: {
        companyId: companyId
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            date: true,
            company: true,
          }
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const income = await this.prisma.income.findUnique({ 
      where: { id },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            date: true,
          }
        }
      }
    });
    if (!income) throw new NotFoundException('Income record not found');
    return income;
  }

  async update(id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException('Income record not found');

    return this.prisma.income.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : income.date,
        tripId: dto.tripId ?? null,
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            date: true,
          }
        }
      }
    });
  }

  async remove(id: string) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException('Income record not found');

    return this.prisma.income.delete({ where: { id } });
  }
}