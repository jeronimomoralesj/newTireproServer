import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsArray()
  plates: string[];

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
