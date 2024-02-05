import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtGuard, LocalAuthGuard } from './guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('verify')
  async verify(@Body() body) {
    return await this.authService.verifyAccount(body.code, body.email);
  }

  @Post('signup')
  Signup(@Body() dto: AuthRegisterDto) {
    return this.authService.signup(dto);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body) {
    return await this.authService.resendVerifyCode(body.email);
  }

  @Post('refresh')
  async refresh(
    @Body() body: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.refresh(body.token);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return { token };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Some internal checks
    res.cookie('access_token', '', {
      expires: new Date(),
      httpOnly: true,
      secure: true,
    });

    return { message: 'success' };
  }

  @UseGuards(JwtGuard)
  @Post('2fa/authenticate')
  @HttpCode(200)
  async authenticate(@Req() request, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.loginWith2fa(request.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login-passwordless')
  @HttpCode(200)
  async login(@Body() body) {
    const userWithoutPsw: Partial<User> = body.user;

    return this.authService.loginPasswordless(userWithoutPsw);
  }

  @UseGuards(JwtGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.authService.turnOnTwoFactorAuthentication(request.user.id);
    return { message: 'Two factor authentication turned on' };
  }

  @Post('2fa/generate')
  @UseGuards(JwtGuard)
  async generate(@Res() response, @Req() request) {
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    return response.json(
      await this.authService.generateQrCodeDataURL(otpAuthUrl),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginCookie(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(dto);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      expires: new Date(new Date() + this.config.get('JWT_COOKIE_MAX_AGE')),
    });
    return { access_token: token };
  }

  @Post('change-password')
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }
}
