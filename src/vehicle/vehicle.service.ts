// src/app/vehicle/vehicle.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateKilometrajeDto } from './dto/update-kilometraje.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new vehicle
  async create(data: CreateVehicleDto) {
  try {
    return this.prisma.vehicle.create({
      data: {
        ...data,
        axles: data.axles as any,
      },
    });
  } catch (error) {
    console.error('Vehicle creation failed:', error);
    throw error;
  }
}
  // Get all vehicles by companyId
  async findVehiclesByCompany(companyId: string) {
    return this.prisma.vehicle.findMany({
      where: { companyId },
    });
  }

  // Delete vehicle by ID
  async deleteVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.prisma.vehicle.delete({ where: { id } });
  }

  // Find vehicle by license plate (placa)
  async findByPlate(licensePlate: string) {
    return this.prisma.vehicle.findFirst({
      where: { licensePlate },
    });
  }

  // Update mileage (kilometraje)
  async updateMileage(id: string, mileage: number) {
  const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new NotFoundException('Vehicle not found');

  return this.prisma.vehicle.update({
    where: { id },
    data: { mileage },
  });
}

  // Update tire count
  async updateTireCount(id: string, tireCount: number) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { tireCount },
    });
  }

  async findById(id: string) {
  return this.prisma.vehicle.findUnique({ where: { id } });
}

}
