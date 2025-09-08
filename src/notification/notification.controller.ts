// notification.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('company/:companyId')
async getByCompany(@Param('companyId') companyId: string) {
  return this.notificationService.getByCompany(companyId); // ✅
}

  @Get('user/:userId')
async getByUser(@Param('userId') userId: string) {
  return this.notificationService.getByUser(userId); 
}
}
