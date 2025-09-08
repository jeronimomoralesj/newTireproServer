import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';

@Module({
  controllers: [IncomeController],
  providers: [IncomeService, PrismaService],
  exports: [IncomeService], // <-- Important so other modules can use it
})
export class IncomeModule {}
