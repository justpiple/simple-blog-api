import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { compareData, encryptData } from '../../utils/encryption.utils';
import { UserWithoutPasswordType } from '../users/users.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, name: string, password: string) {
    const findUser = await this.usersService.getUser({ email });
    if (findUser)
      throw new ForbiddenException(`User with email ${email} already exists`);

    const data: Prisma.UserCreateInput = {
      email,
      name,
      password: await encryptData(password),
    };

    return await this.usersService.createUser(data);
  }

  async signIn(email: string, pass: string) {
    const findUser = await this.usersService.getUser({ email });
    if (!findUser)
      throw new UnauthorizedException(`Email or Password is incorrect`);

    const correctPass = await compareData(pass, findUser.password);
    if (!correctPass)
      throw new UnauthorizedException('Email or Password is incorrect');

    const { password, ...userInfo } = findUser;

    const payload: UserWithoutPasswordType = userInfo;

    return {
      access_token: await this.jwtService.signAsync(payload),
      ...payload,
    };
  }
}
