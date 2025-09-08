import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    console.log('Controller received DTO:', dto); // Debug log
    return this.incomeService.create(dto);
  }

  @Get()
  findAll() {
    return this.incomeService.findAll();
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.incomeService.findByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto) {
    return this.incomeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeService.remove(id);
  }
}