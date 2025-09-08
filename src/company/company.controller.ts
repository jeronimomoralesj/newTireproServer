import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register')
  async createCompany(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get(':companyId')
  async getCompanyById(@Param('companyId') companyId: string) {
    return this.companyService.getComapnyById(companyId);
  }
}