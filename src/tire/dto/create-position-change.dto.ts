export class CreateTirePositionChangeDto {
  tireId: string;
  value: number;
  date: string;
  vehicleId?: string; // Optional vehicleId for when moving to vehicle
}