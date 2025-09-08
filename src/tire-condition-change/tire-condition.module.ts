import { Module } from '@nestjs/common';
import { TireConditionService } from './tire-condition.service';
import { TireConditionController } from './tire-condition.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TireConditionService, PrismaService],
  controllers: [TireConditionController],
  exports: [TireConditionService],
})
export class TireConditionModule {}
