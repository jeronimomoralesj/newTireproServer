import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class InstallmentDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;
}

class PaymentStructureDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstallmentDto)
  installments?: InstallmentDto[];

  @IsOptional()
  @IsNumber()
  fullPayment?: number;
}

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentStructureDto)
  paymentStructure?: PaymentStructureDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  startCoords?: CoordinatesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  endCoords?: CoordinatesDto;

  @IsString()
  @IsNotEmpty()
  startLocation: string;

  @IsString()
  @IsNotEmpty()
  endLocation: string;

  // Add the required user and company fields
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}