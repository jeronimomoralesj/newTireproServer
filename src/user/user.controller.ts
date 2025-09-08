import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get('verify')
  async verifyUser(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Invalid link');
    return this.userService.verifyUserByToken(token);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  async getUserByEmail(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.userService.getUserByEmail(email);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(id, body.currentPassword, body.newPassword);
  }

  @Patch(':id/add-plate')
  async addPlate(@Param('id') id: string, @Body() body: { plate: string }) {
    return this.userService.addPlate(id, body.plate);
  }

  @Patch(':id/remove-plate/:plate')
async removePlate(@Param('id') userId: string, @Param('plate') plate: string) {
  return this.userService.removePlate(userId, plate);
}

  @Get('/company/:companyId')
async getUsersByCompany(@Param('companyId') companyId: string) {
  return this.userService.getUsersByCompany(companyId);
}

@Patch(':id/language')
async updatePreferredLanguage(
  @Param('id') id: string,
  @Body() body: { preferredLanguage: 'en' | 'es' }
) {
  return this.userService.updatePreferredLanguage(id, body.preferredLanguage);
}

}
