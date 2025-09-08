// notification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async triggerInspectionAlert({
    tireId,
    vehicleId,
    companyId,
    userId,
    depthValues,
  }: {
    tireId: string;
    vehicleId: string;
    companyId: string;
    userId: string;
    depthValues: { cen: number; ext: number; int: number };
  }) {
    const minDepth = Math.min(depthValues.cen, depthValues.ext, depthValues.int);

    let severity: 'critical' | 'warning' | 'info' | null = null;

    // 🧠 Decision tree
    if (minDepth < 2) severity = 'critical';
    else if (minDepth < 4) severity = 'warning';
    else if (minDepth < 6) severity = 'info';

    if (!severity) return; // No alert needed

    const existing = await this.prisma.notification.findFirst({
      where: {
        tireId,
        vehicleId,
        isRead: false,
        actionTaken: false,
      },
    });

    if (existing) return;

    await this.prisma.notification.create({
      data: {
        tireId,
        vehicleId,
        companyId,
        userId,
        type: 1,
        severity,
        title: `Tire Alert: ${severity.toUpperCase()}`,
        message: `Tire has low depth (${minDepth}mm). Please inspect.`,
        isRead: false,
        isEmailSent: false,
        actionTaken: false,
        actionDate: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });
  }

  async getByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByCompany(companyId: string) {
    return this.prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}