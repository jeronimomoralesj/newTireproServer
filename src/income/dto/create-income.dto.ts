// dto/create-income.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  companyPaying?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsObject()
  paymentStructure?: any;
}