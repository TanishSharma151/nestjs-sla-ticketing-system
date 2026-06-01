import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService }
  from 'src/prisma/prisma.service';

import { SignupDto }
  from './dto/signup.dto';

import { JwtService }
  from '@nestjs/jwt';

import { LoginDto }
  from './dto/login.dto';

import * as bcrypt
  from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,

    private jwtService: JwtService,
  ) { }

  async signup(
    dto: SignupDto,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        'User already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      await this.prisma.user.create({
        data: {
          name : dto.name,

          email: dto.email,

          password:
            hashedPassword,
        },
      });

    return {
      message:
        'User created successfully',

      user: {
        id: user.id,

        email: user.email,
      },
    };
  }

  async login(
    dto: LoginDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },

        include: {
          memberships: true,
        },
      });

    if (!user) {
      throw new BadRequestException(
        'Invalid credentials',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordMatches) {
      throw new BadRequestException(
        'Invalid credentials',
      );
    }

    const membership =
      user.memberships?.[0];

    const token =
      await this.jwtService.signAsync({
        userId: user.id,

        email: user.email,

        role:
          membership?.role ||
          'AGENT',
      });

    return {
      access_token: token,
    };
  }

  async me(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        include: {
          memberships: true,
        },
      });

    return user;
  }
}