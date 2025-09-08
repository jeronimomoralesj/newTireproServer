// Add this to your tire-inspection.module.ts or app.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TireInspectionController } from './tire-inspection.controller';
import { TireInspectionService } from './tire-inspection.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [TireInspectionController],
  providers: [
    TireInspectionService, 
    PrismaService, 
    NotificationService, 
    S3Service
  ],
  exports: [TireInspectionService],
})
export class TireInspectionModule {}