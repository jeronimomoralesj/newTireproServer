import { IsInt } from 'class-validator';

export class UpdateTireMileageDto {
  @IsInt()
  mileage: number;
}
