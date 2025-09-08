import { Module } from '@nestjs/common';
import { TireCostService } from './tire-cost.service';
import { TireCostController } from './tire-cost.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TireCostController],
  providers: [TireCostService, PrismaService],
})
export class TireCostModule {}
