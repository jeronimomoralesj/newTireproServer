import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExtraService } from './extra.service';
import { ExtraController } from './extra.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ExtraController],
  providers: [ExtraService, PrismaService, S3Service],
  exports: [ExtraService],
})
export class ExtraModule {}
