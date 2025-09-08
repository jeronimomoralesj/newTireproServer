import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        verificationToken,
        role: dto.role || 'admin',
        preferredLanguage: dto.preferredLanguage || 'en',
        currency: dto.currency || 'usd',
      },
    });

    await this.emailService.sendConfirmationEmail(
      user.email,
      user.verificationToken!,
      user.preferredLanguage,
    );

    return {
      message: 'User created. Please check your email to verify your account.',
      user: { id: user.id, email: user.email },
    };
  }

  async verifyUserByToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  async addPlate(id: string, plate: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updatedPlates = Array.from(new Set([...(user.plates || []), plate]));

    await this.prisma.user.update({
      where: { id },
      data: { plates: updatedPlates },
    });

    return { message: 'Plate added', plates: updatedPlates };
  }

  async removePlate(userId: string, plate: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error('User not found');

  const updatedPlates = user.plates.filter((p) => p !== plate);

  return this.prisma.user.update({
    where: { id: userId },
    data: { plates: updatedPlates },
  });
}

async getUsersByCompany(companyId: string) {
  return this.prisma.user.findMany({
    where: { companyId },
  });
}


async getUserWithCompany(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
    },
  });

  if (!user) throw new NotFoundException('User not found');
  return user;
}

async updatePreferredLanguage(id: string, preferredLanguage: 'en' | 'es') {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException('User not found');

  return this.prisma.user.update({
    where: { id },
    data: { preferredLanguage },
  });
}

}
