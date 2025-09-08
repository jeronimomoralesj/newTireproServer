import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
  const fullUser = await this.userService.getUserWithCompany(user.id);

  const payload = { sub: fullUser.id, email: fullUser.email };
  return {
    access_token: this.jwtService.sign(payload),
    user: fullUser, // now includes company data
  };
}
}
