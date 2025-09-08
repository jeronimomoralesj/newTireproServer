import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService],
})
export class VehicleModule {}
