import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { TireService } from './tire.service';
import { CreateTireDto } from './dto/create-tire.dto';
import { CreateTirePositionChangeDto } from './dto/create-position-change.dto';
import { UpdateTireMileageDto } from './dto/update-mileage.dto';

@Controller('tire')
export class TireController {
  constructor(private readonly tireService: TireService) {}

  @Post('create')
  async createTire(@Body() dto: CreateTireDto) {
    return this.tireService.create(dto);
  }

  @Get('by-company/:companyId')
  async getTiresByCompany(@Param('companyId') companyId: string) {
    return this.tireService.findTiresByCompany(companyId);
  }

  @Get('by-vehicle/:vehicleId')
  async getTiresByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.tireService.findTiresByVehicle(vehicleId);
  }

  @Post('position')
  async addPositionChange(@Body() dto: CreateTirePositionChangeDto) {
    return this.tireService.addPositionChange(dto);
  }

  @Get('by-custom-id/:customId')
async getTireByCustomId(@Param('customId') customId: string) {
  return this.tireService.findByCustomId(customId);
}

@Get(':id')
async getById(@Param('id') id: string) {
  return this.tireService.findById(id);
}

@Patch(':id/miles')
updateMileage(
  @Param('id') id: string,
  @Body() dto: UpdateTireMileageDto
) {
  return this.tireService.updateMileage(id, dto.mileage);
}

@Patch(':id/vehicle')
async updateTireVehicle(
  @Param('id') id: string,
  @Body('vehicleId') vehicleId: string | null
) {
  return this.tireService.updateTireVehicle(id, vehicleId);
}

@Get('company/:companyId/all')
async getAllTiresByCompany(@Param('companyId') companyId: string) {
  return this.tireService.findAllTiresByCompany(companyId);
}

}
