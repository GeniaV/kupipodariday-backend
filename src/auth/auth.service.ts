import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/hash/hash.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private hashService: HashService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const userPassword = password;
    const user = await this.usersService.findByUsername(username);
    const hash = await this.hashService.hash(password);
    if (user && user.password) {
      const isValidHash = await this.hashService.verifyHash(userPassword, hash);
      return isValidHash ? user : null;
    }
    return null;
  }
}
