import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTireInspectionDto {
  @IsString()
  tireId: string;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : new Date())
  date?: Date;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  cenDepth: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  extDepth: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  intDepth: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  pressure?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsNumber()
  updatedMileage?: number;

  @IsString()
  userId: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  cpm: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  forecastedCpm: number;
}