import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

export type InstallmentStructure = Record<string, any>;

@Injectable()
export class ExtraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    dto: {
      vehicleId: string;
      type: string;
      brand: string;
      purchaseDate: string | Date;
      cost: number;
      notes?: string | null;
      tittle: string;
      date: string;
      paymentType: string;
      installmentStructure?: InstallmentStructure | null;
      tripId?: string | null;
      receipt?: string | null;
    },
    file?: Express.Multer.File,
  ) {
    if (!dto.vehicleId) throw new BadRequestException('vehicleId is required');
    if (!dto.type) throw new BadRequestException('type is required');
    if (!dto.tittle) throw new BadRequestException('tittle is required');
    if (dto.cost === undefined || dto.cost === null)
      throw new BadRequestException('cost is required');

    // Verify vehicle exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!existingVehicle) {
      throw new BadRequestException(
        `Vehicle with ID ${dto.vehicleId} not found`,
      );
    }

    // Normalize date
    const purchaseDate = dto.purchaseDate
      ? new Date(dto.purchaseDate)
      : new Date();

    // Handle file upload
    let receiptUrl = dto.receipt ?? null;
    if (file) {
      try {
        // Validate file type
        if (!this.s3Service.isSupportedFileType(file.mimetype)) {
          throw new BadRequestException(
            'Unsupported file type. Only images (JPEG, PNG, GIF, BMP, TIFF, WebP) and PDF files are allowed.'
          );
        }

        // Upload to S3
        receiptUrl = await this.s3Service.uploadFile(file, 'receipts');
      } catch (error) {
        console.error('File upload error:', error);
        throw new BadRequestException(
          `Failed to upload receipt: ${error.message}`
        );
      }
    }

    try {
      const extra = await this.prisma.extra.create({
        data: {
          type: dto.type,
          brand: dto.brand || '',
          purchaseDate,
          cost: Number(dto.cost), // Ensure it's a number
          notes: dto.notes || null, // Convert undefined to null
          tittle: dto.tittle,
          date: dto.date,
          paymentType: dto.paymentType,
          installmentStructure: dto.installmentStructure ?? {},
          tripId: dto.tripId || null, // Convert undefined to null
          receipt: receiptUrl,
          vehicle: {
            connect: { id: dto.vehicleId },
          },
        },
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              companyId: true,
            },
          },
        },
      });

      return extra;
    } catch (error) {
      // If database creation fails but file was uploaded, attempt cleanup
      if (receiptUrl && file) {
        try {
          await this.s3Service.deleteFile(receiptUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup uploaded file:', deleteError);
          // Don't throw error here as it's just cleanup
        }
      }
      
      console.error('Database creation error:', error);
      throw new BadRequestException('Failed to create extra cost entry');
    }
  }

  async findById(id: string) {
    const extra = await this.prisma.extra.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            companyId: true,
          },
        },
      },
    });
    if (!extra) throw new NotFoundException('Extra not found');
    return extra;
  }

  async findByVehicle(vehicleId: string) {
    return this.prisma.extra.findMany({
      where: { vehicleId },
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  async update(
    id: string, 
    dto: Partial<{
      type: string;
      brand: string;
      purchaseDate: string | Date;
      cost: number;
      notes?: string | null;
      tittle?: string;
      date?: string;
      paymentType?: string;
      installmentStructure?: InstallmentStructure | null;
      tripId?: string | null;
      receipt?: string | null;
      vehicleId?: string;
    }>,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.extra.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Extra not found');

    const data: any = { ...dto };
    if (dto.purchaseDate) {
      data.purchaseDate = new Date(dto.purchaseDate);
    }

    // If installmentStructure is undefined, do not overwrite
    if (dto.installmentStructure === undefined) delete data.installmentStructure;

    // If vehicleId is being updated, verify the new vehicle exists
    if (dto.vehicleId) {
      const vehicleExists = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicleId }
      });
      if (!vehicleExists) {
        throw new BadRequestException(`Vehicle with ID ${dto.vehicleId} not found`);
      }
    }

    // Handle file upload for updates
    if (file) {
      try {
        // Validate file type
        if (!this.s3Service.isSupportedFileType(file.mimetype)) {
          throw new BadRequestException(
            'Unsupported file type. Only images (JPEG, PNG, GIF, BMP, TIFF, WebP) and PDF files are allowed.'
          );
        }

        // Upload new file
        const newReceiptUrl = await this.s3Service.uploadFile(file, 'receipts');
        
        // Store old receipt URL for cleanup
        const oldReceiptUrl = existing.receipt;
        
        // Update data with new receipt URL
        data.receipt = newReceiptUrl;

        // Update the record
        const updated = await this.prisma.extra.update({
          where: { id },
          data,
          include: {
            vehicle: {
              select: {
                id: true,
                licensePlate: true,
                companyId: true,
              },
            },
          },
        });

        // Clean up old file if it exists
        if (oldReceiptUrl) {
          try {
            await this.s3Service.deleteFile(oldReceiptUrl);
          } catch (deleteError) {
            console.error('Failed to delete old receipt file:', deleteError);
            // Don't throw error here as the update was successful
          }
        }

        return updated;
      } catch (error) {
        console.error('File upload error during update:', error);
        throw new BadRequestException(
          `Failed to upload receipt: ${error.message}`
        );
      }
    } else {
      // No file upload, just update other fields
      const updated = await this.prisma.extra.update({
        where: { id },
        data,
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              companyId: true,
            },
          },
        },
      });

      return updated;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.extra.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Extra not found');

    // Delete the record first
    await this.prisma.extra.delete({ where: { id } });

    // Clean up associated file if it exists
    if (existing.receipt) {
      try {
        await this.s3Service.deleteFile(existing.receipt);
      } catch (deleteError) {
        console.error('Failed to delete receipt file:', deleteError);
        // Don't throw error here as the record deletion was successful
      }
    }

    return { message: 'Extra deleted successfully', id };
  }

  async findByCompany(companyId: string) {
    return this.prisma.extra.findMany({
      where: {
        vehicle: {
          companyId,
        },
      },
      include: {
        vehicle: {
          select: { id: true, licensePlate: true },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }
}