import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtraService } from './extra.service';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsISO8601,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateExtraDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsISO8601()
  purchaseDate?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsNumber()
  @Type(() => Number)
  cost: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  tittle: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  paymentType: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  installmentStructure?: Record<string, any>;

  @IsOptional()
  @IsString()
  tripId?: string;

  // Remove receipt from DTO since it will be handled as file upload
}

export class UpdateExtraDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsISO8601()
  purchaseDate?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsNumber()
  @Type(() => Number)
  cost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  tittle?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  installmentStructure?: Record<string, any>;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;
}

@Controller('extra')
export class ExtraController {
  constructor(private readonly extraService: ExtraService) {}

  @Post()
  @UseInterceptors(FileInterceptor('receipt')) // Changed from 'file' to 'receipt'
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateExtraDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB limit
          new FileTypeValidator({ 
            fileType: /(jpg|jpeg|png|gif|pdf|bmp|tiff|webp)$/i 
          }),
        ],
        fileIsRequired: false, // Receipt is optional
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (!dto.vehicleId) throw new BadRequestException('vehicleId required');
    
    try {
      const extra = await this.extraService.create(dto as any, file);
      return { message: 'Extra created successfully', extra };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create extra cost entry'
      );
    }
  }

  @Get('vehicle/:vehicleId')
  async getByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.extraService.findByVehicle(vehicleId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.extraService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('receipt'))
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateExtraDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB limit
          new FileTypeValidator({ 
            fileType: /(jpg|jpeg|png|gif|pdf|bmp|tiff|webp)$/i 
          }),
        ],
        fileIsRequired: false, // Receipt is optional
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      return await this.extraService.update(id, dto as any, file);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update extra cost entry'
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.extraService.remove(id);
  }

  // Optional: get all extras by company
  @Get('company/:companyId/all')
  async getByCompany(@Param('companyId') companyId: string) {
    return this.extraService.findByCompany(companyId);
  }
}