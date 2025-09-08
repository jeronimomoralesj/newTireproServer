import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TireConditionService } from './tire-condition.service';
import { CreateConditionDto } from './dto/create-condition.dto';

@Controller('tire-condition')
export class TireConditionController {
  constructor(private readonly conditionService: TireConditionService) {}
@Post()
async createCondition(@Body() dto: CreateConditionDto) {
  return this.conditionService.create(dto);
}

  @Get('by-tire/:tireId')
getByTire(@Param('tireId') tireId: string) {
  return this.conditionService.getByTire(tireId);
}

@Get('disposals/:companyId')
getDisposalsByCompany(@Param('companyId') companyId: string) {
  return this.conditionService.getDisposalsByCompany(companyId);
}

}
