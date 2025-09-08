import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';;

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Get('company/:companyId')
  getByCompany(@Param('companyId') companyId: string) {
    return this.vehicleService.findVehiclesByCompany(companyId);
  }

  @Get(':id')
getById(@Param('id') id: string) {
  return this.vehicleService.findById(id);
}

  @Get('placa/:licensePlate')
  getByPlaca(@Param('licensePlate') licensePlate: string) {
    return this.vehicleService.findByPlate(licensePlate);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vehicleService.deleteVehicle(id);
  }

  @Patch(':id/mileage')
updateMileage(
  @Param('id') id: string,
  @Body('mileage') mileage: number
) {
  return this.vehicleService.updateMileage(id, mileage);
}

  @Patch(':id/tire-count')
  updateTireCount(@Param('id') id: string, @Body('tireCount') tireCount: number) {
    return this.vehicleService.updateTireCount(id, tireCount);
  }

}
