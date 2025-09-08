import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express'; 
import { TireInspectionService } from './tire-inspection.service';
import { CreateTireInspectionDto } from './dto/create-tire-inspection.dto';

@Controller('tire-inspection')
export class TireInspectionController {
  constructor(private readonly tireInspectionService: TireInspectionService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createTireInspectionDto: CreateTireInspectionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      console.log('Received inspection data:', createTireInspectionDto);
      console.log('Received file:', file ? { 
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      // Validate required fields
      if (!createTireInspectionDto.tireId) {
        throw new BadRequestException('tireId is required');
      }
      
      if (!createTireInspectionDto.cenDepth || !createTireInspectionDto.extDepth || !createTireInspectionDto.intDepth) {
        throw new BadRequestException('All depth measurements (cenDepth, extDepth, intDepth) are required');
      }

      // Convert string values to numbers
      const dto: CreateTireInspectionDto = {
        ...createTireInspectionDto,
        cenDepth: parseFloat(createTireInspectionDto.cenDepth as any) || 0,
        extDepth: parseFloat(createTireInspectionDto.extDepth as any) || 0,
        intDepth: parseFloat(createTireInspectionDto.intDepth as any) || 0,
        pressure: createTireInspectionDto.pressure ? parseFloat(createTireInspectionDto.pressure as any) : undefined,
        updatedMileage: createTireInspectionDto.updatedMileage ? parseInt(createTireInspectionDto.updatedMileage as any) : undefined,
        cpm: parseFloat(createTireInspectionDto.cpm as any) || 0,
        forecastedCpm: parseFloat(createTireInspectionDto.forecastedCpm as any) || 0,
        date: createTireInspectionDto.date ? new Date(createTireInspectionDto.date) : new Date(),
      };

      return await this.tireInspectionService.create(dto, file);
    } catch (error) {
      console.error('Error creating tire inspection:', error);
      throw error;
    }
  }

  @Get('tire/:tireId')
  async findByTire(@Param('tireId') tireId: string) {
    return this.tireInspectionService.findByTire(tireId);
  }

  @Get('company/:companyId/average-cpm')
  async getAverageCpm(@Param('companyId') companyId: string) {
    return this.tireInspectionService.getLatestAverageCpmByCompany(companyId);
  }

  @Get('company/:companyId/average-forecasted-cpm')
  async getAverageForecastedCpm(@Param('companyId') companyId: string) {
    return this.tireInspectionService.getLatestAverageForecastedCpmByCompany(companyId);
  }
}