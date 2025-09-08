import { Module } from '@nestjs/common';
import { TireService } from './tire.service';
import { TireController } from './tire.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TireController],
  providers: [TireService, PrismaService],
})
export class TireModule {}
