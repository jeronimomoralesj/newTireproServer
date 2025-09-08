export class CreateVehicleDto {
  companyId: string;
  licensePlate: string;
  mileage: number;
  loadType: string;
  loadWeight: number;
  maxLoadCapacity: number;
  isActive: boolean;
  tireCount: number;
  union: string;
  owner: string;
  axles: { id: string; tireType: string }[];
}
