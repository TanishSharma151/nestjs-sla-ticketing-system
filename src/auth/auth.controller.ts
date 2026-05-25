import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result =
      await this.authService.login(dto);

    res.cookie(
      'access_token',
      result.access_token,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      },
    );

    return {
      message: 'Login successful',
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');

    return {
      message: 'Logged out',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(
      req.user.userId,
    );
  }

}