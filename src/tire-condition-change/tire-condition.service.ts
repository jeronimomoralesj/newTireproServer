import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConditionDto } from './dto/create-condition.dto';

@Injectable()
export class TireConditionService {
  constructor(private readonly prisma: PrismaService) {}

async create(dto: CreateConditionDto) {
  try {
    // 1. Create Tire Condition
    const condition = await this.prisma.tireConditionChange.create({
      data: {
        tireId: dto.tireId,
        value: dto.value,
        date: new Date(dto.date),
        design: dto.design,
        cost: dto.cost,
        provider: dto.provider,
        motive: dto.motive,
        remainingMM: dto.remainingMM,
      },
    });

    // 2. Save cost if provided
    if (dto.cost && dto.cost > 0) {
      await this.prisma.tireCost.create({
        data: {
          tireId: dto.tireId,
          value: dto.cost,
          date: new Date(dto.date),
          supplier: dto.provider ?? 'Unknown',
        },
      });
    }

    // 3. Update design if it's a retread
    const isRetread = dto.value.toLowerCase().includes('retread') || dto.value.toLowerCase().includes('reencauche');

    if (isRetread && dto.design) {
      await this.prisma.tire.update({
        where: { id: dto.tireId },
        data: {
          design: dto.design,
        },
      });
    }

    // ✅ 4. If motive and remainingMM exist, treat as END OF LIFE
    if (dto.motive && dto.remainingMM !== undefined) {
      const tire = await this.prisma.tire.findUnique({
        where: { id: dto.tireId },
      });

      if (!tire) throw new Error('Tire not found');

      // 4.1 Create TirePositionChange with value 0
      await this.prisma.tirePositionChange.create({
        data: {
          tireId: dto.tireId,
          value: 0,
          date: new Date(dto.date),
        },
      });

      // 4.2 Set tire.vehicleId to null
      await this.prisma.tire.update({
        where: { id: dto.tireId },
        data: {
          vehicleId: null,
        },
      });

      // 4.3 Reduce tireCount in the vehicle by 1
      if (tire.vehicleId) {
        const vehicle = await this.prisma.vehicle.findUnique({
          where: { id: tire.vehicleId },
        });

        if (vehicle) {
          await this.prisma.vehicle.update({
            where: { id: tire.vehicleId },
            data: {
              tireCount: { decrement: 1 },
            },
          });
        }
      }
    }

    return condition;
  } catch (error) {
    console.error('[TireConditionService.create] ERROR:', error);
    throw error;
  }
}

  async getByTire(tireId: string) {
    return this.prisma.tireConditionChange.findMany({
      where: { tireId },
      orderBy: { date: 'desc' },
    });
  }

async getDisposalsByCompany(companyId: string) {
  return this.prisma.tireConditionChange.findMany({
    where: {
      tire: {
        companyId
      }
    },
    include: {
      tire: true
    },
    orderBy: {
      date: 'desc'
    }
  });
}

}
