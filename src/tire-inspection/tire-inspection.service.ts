import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTireInspectionDto } from './dto/create-tire-inspection.dto';
import { NotificationService } from '../notification/notification.service';
import { S3Service } from '../s3/s3.service'; 

@Injectable()
export class TireInspectionService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private s3Service: S3Service, // ✅ inject S3 service
  ) {}

  async create(dto: CreateTireInspectionDto, file?: Express.Multer.File) {
    const tire = await this.prisma.tire.findUnique({
      where: { id: dto.tireId },
      include: { costs: true },
    });

    if (!tire) throw new NotFoundException('Tire not found');

    let imageUrl = dto.imageUrl;
    if (file) {
      imageUrl = await this.s3Service.uploadImage(file); // ✅ save file to S3
    }

    if (dto.updatedMileage && dto.updatedMileage > tire.tireMiles) {
      await this.prisma.tire.update({
        where: { id: tire.id },
        data: { tireMiles: dto.updatedMileage },
      });
      tire.tireMiles = dto.updatedMileage;
    }

    const totalCost = tire.costs.reduce((sum, cost) => sum + cost.value, 0);
    const tireMiles = tire.tireMiles || 1;
    const initialDepth = tire.initialDepth || 1;

    const cpm = totalCost / tireMiles;
    const minDepth = Math.min(dto.cenDepth, dto.extDepth, dto.intDepth);
    const wearRatio = (initialDepth - minDepth) / initialDepth || 0.001;
    const forecastedCpm = totalCost / (tireMiles / wearRatio);

    const inspection = await this.prisma.tireInspection.create({
  data: {
    tireId: dto.tireId,
    date: dto.date ? new Date(dto.date) : new Date(),
    imageUrl,
    cenDepth: dto.cenDepth,
    extDepth: dto.extDepth,
    intDepth: dto.intDepth,
    pressure: dto.pressure,
    cpm,
    forecastedCpm,
  },
});

    await this.updateTireStats(dto.tireId);

    await this.notificationService.triggerInspectionAlert({
      tireId: dto.tireId,
      vehicleId: tire.vehicleId!,
      companyId: tire.companyId,
      userId: dto.userId,
      depthValues: {
        cen: dto.cenDepth,
        ext: dto.extDepth,
        int: dto.intDepth,
      },
    });

    return { message: 'Inspection recorded successfully', inspection };
  }

  async findByTire(tireId: string) {
    return this.prisma.tireInspection.findMany({
      where: { tireId },
      orderBy: { date: 'desc' },
    });
  }

  async updateTireStats(tireId: string) {
    const tire = await this.prisma.tire.findUnique({
      where: { id: tireId },
      include: {
        costs: true,
        inspections: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!tire || tire.tireMiles === 0 || tire.costs.length === 0 || tire.inspections.length === 0) {
      console.warn(`⚠️ Skipping TireConditionStat update for tire ${tireId}`);
      return;
    }

    const totalCost = tire.costs.reduce((sum, cost) => sum + cost.value, 0);
    const cpm = totalCost / tire.tireMiles;

    const inspection = tire.inspections[0];
    const currentMinDepth = Math.min(inspection.extDepth, inspection.intDepth, inspection.cenDepth);
    const wearRatio = (tire.initialDepth - currentMinDepth) / tire.initialDepth || 0.001;
    const forecastCPM = totalCost / (tire.tireMiles / wearRatio);

    await this.prisma.tireConditionStat.upsert({
      where: { tireId },
      update: { cpm, forecastCPM },
      create: { tireId, cpm, forecastCPM },
    });
  }

  async getLatestAverageCpmByCompany(companyId: string) {
    // 1. Get all tire IDs for the company
    const tires = await this.prisma.tire.findMany({
      where: { companyId },
      select: { id: true },
    });

    const tireIds = tires.map((t) => t.id);

    if (tireIds.length === 0) return { averageCpm: 0 };

    // 2. Get latest inspection for each tire
    const inspections = await this.prisma.tireInspection.findMany({
      where: { tireId: { in: tireIds } },
      orderBy: [{ date: 'desc' }],
    });

    const latestByTire = new Map<string, number>(); // tireId -> cpm

    for (const inspection of inspections) {
      if (!latestByTire.has(inspection.tireId)) {
        latestByTire.set(inspection.tireId, inspection.cpm);
      }
    }

    // 3. Calculate average CPM
    const totalCpm = Array.from(latestByTire.values()).reduce((sum, cpm) => sum + cpm, 0);
    const averageCpm = totalCpm / latestByTire.size;

    return { averageCpm };
  }

async getLatestAverageForecastedCpmByCompany(companyId: string) {
  // 1. Get all tire IDs for the company
  const tires = await this.prisma.tire.findMany({
    where: { companyId },
    select: { id: true },
  });

  const tireIds = tires.map((t) => t.id);
  if (tireIds.length === 0) return { averageForecastedCpm: 0 };

  // 2. Get all inspections, ordered by most recent
  const inspections = await this.prisma.tireInspection.findMany({
    where: { tireId: { in: tireIds } },
    orderBy: [{ date: 'desc' }],
  });

  const latestForecastedByTire = new Map<string, number>();

  for (const inspection of inspections) {
    if (!latestForecastedByTire.has(inspection.tireId)) {
      latestForecastedByTire.set(inspection.tireId, inspection.forecastedCpm);
    }
  }

  // 3. Calculate average
  const total = Array.from(latestForecastedByTire.values()).reduce((sum, fcp) => sum + fcp, 0);
  const averageForecastedCpm = total / latestForecastedByTire.size;

  return { averageForecastedCpm };
}
}
