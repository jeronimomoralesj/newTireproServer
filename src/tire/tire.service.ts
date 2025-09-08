import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTireDto } from './dto/create-tire.dto';
import { CreateTirePositionChangeDto } from './dto/create-position-change.dto';

@Injectable()
export class TireService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateTireDto) {
  try {
    const tire = await this.prisma.tire.create({
      data: {
        companyId: dto.companyId,
        vehicleId: dto.vehicleId, // <-- validate this before use
        customId: dto.customId,
        brand: dto.brand,
        design: dto.design,
        initialDepth: dto.initialDepth,
        dimension: dto.dimension,
        axis: dto.axis,
      },
    });

    await this.prisma.tireCost.create({
      data: {
        tireId: tire.id,
        value: dto.cost.value,
        date: new Date(dto.cost.date),
        supplier: dto.cost.supplier,
      },
    });

    await this.prisma.tireConditionChange.create({
  data: {
    tireId: tire.id,
    value: dto.condition,
    date: new Date(),
  },
});

    if (dto.position !== undefined && dto.position !== null) {
      await this.prisma.tirePositionChange.create({
        data: {
          tireId: tire.id,
          value: Number(dto.position),
          date: new Date(),
        },
      });
    }

    return {
      message: 'Tire created with cost, condition, and initial position',
      tireId: tire.id,
    };
  } catch (error) {
    console.error('❌ Error creating tire:', error);
    throw new Error('Failed to create tire: ' + error.message);
  }
}

async findTiresByCompany(companyId: string) {
  return this.prisma.tire.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      positions: {
        orderBy: { date: 'desc' },
        take: 1, // ✅ get latest position
      },
      vehicle: {
        select: { licensePlate: true },
      }
    },
  });
}


async findTiresByVehicle(vehicleId: string) {
  return this.prisma.tire.findMany({
    where: { vehicleId },
    include: {
      conditions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
      positions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' }
  });
}

async addPositionChange(dto: CreateTirePositionChangeDto) {
  const tire = await this.prisma.tire.findUnique({
    where: { id: dto.tireId },
  });

  if (!tire) throw new Error('Tire not found');

  // Create the position change record
  const positionChange = await this.prisma.tirePositionChange.create({
    data: {
      tireId: dto.tireId,
      value: dto.value,
      date: new Date(dto.date),
    },
  });

  // If position is 0, set vehicleId to null (inventory)
  // If position > 0, set vehicleId to the provided vehicleId
  const vehicleId = dto.value === 0 ? null : dto.vehicleId || tire.vehicleId;
  
  await this.prisma.tire.update({
    where: { id: dto.tireId },
    data: { vehicleId },
  });

  return positionChange;
}

async findByCustomId(customId: string) {
  return this.prisma.tire.findMany({
    where: { customId },
    include: { 
      vehicle: true,
      positions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    }
  });
}

async findById(id: string) {
  const tire = await this.prisma.tire.findUnique({
    where: { id },
    include: {
      vehicle: true,
      inspections: {
        orderBy: { date: 'desc' }
      },
      costs: {
        orderBy: { date: 'desc' }
      },
      conditions: {
        orderBy: { date: 'desc' }
      },
      positions: {
        orderBy: { date: 'desc' }
      },
    },
  });

  if (!tire) {
    throw new NotFoundException('Tire not found');
  }

  // Add currentPosition for frontend compatibility
  const currentPosition = tire.positions.length > 0 ? tire.positions[0] : null;

  return {
    ...tire,
    currentPosition
  };
}

async updateMileage(id: string, mileage: number) {
  const tire = await this.prisma.tire.findUnique({ where: { id } });
  if (!tire) throw new NotFoundException('Tire not found');

  return this.prisma.tire.update({
    where: { id },
    data: { tireMiles: mileage },
  });
}

async updateTireVehicle(id: string, vehicleId: string | null) {
  const tire = await this.prisma.tire.findUnique({ where: { id } });
  if (!tire) throw new NotFoundException('Tire not found');

  return this.prisma.tire.update({
    where: { id },
    data: { vehicleId },
  });
}

async findAllTiresByCompany(companyId: string) {
  const tires = await this.prisma.tire.findMany({
    where: { companyId },
    include: {
      vehicle: {
        select: { id: true, licensePlate: true }
      },
      conditions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
      positions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Add currentPosition for each tire for frontend compatibility
  return tires.map(tire => ({
    ...tire,
    currentPosition: tire.positions.length > 0 ? tire.positions[0] : null
  }));
}

}