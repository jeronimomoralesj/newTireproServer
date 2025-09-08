import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  async create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Get()
  async findAll() {
    return this.tripService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
}
