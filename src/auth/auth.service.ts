import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { User } from '@prisma/client';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailerService: MailerService,
  ) {}

  generateCode() {
    return Math.floor(10000 + Math.random() * 90000);
  }

  async login(dto: AuthDto) {
    // Check if the user exists in the database
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Check if the password is correct
    const valid = await argon.verify(user.hash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.signToken(user.id, user.email);
    const refreshToken = await this.signTokenRefresh(user.id, user.email);

    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        jwt_token: token,
        refresh_token: refreshToken,
      },
    });

    return token;
  }

  async signup(dto: AuthRegisterDto) {
    // Generate the pass hash
    const hash = await argon.hash(dto.password);

    // Profile photo

    // Save the user in the database
    try {
      const tempUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          city: dto.city,
          username: dto.username,
        },
      });

      const token = await this.signToken(tempUser.id, dto.email);
      const refreshToken = await this.signTokenRefresh(tempUser.id, dto.email);

      const user = await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          jwt_token: token,
          refresh_token: refreshToken,
          authConfirmToken: this.generateCode(),
        },
      });
      await this.sendConfirmationEmail(user).catch((err) => {
        console.log(err);
      });

      // Return the user
      return user.jwt_token;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          // If the user already exists, return an error
          throw new BadRequestException('Email or username already exists');
        }
      }
      throw err;
    }
  }

  async loginWith2fa(userWithoutPsw: Partial<User>) {
    const payload = {
      email: userWithoutPsw.email,
      isTwoFactorAuthenticationEnabled:
        !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: true,
    };

    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Check if the password is correct

    const token = await this.signToken(user.id, user.email);
    const refreshToken = await this.signTokenRefresh(user.id, user.email);

    await this.prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        jwt_token: token,
        refresh_token: refreshToken,
      },
    });

    return token;
  }

  async loginPasswordless(
    userWithoutPsw: Partial<User>,
    isTwoFactorAuthenticated = false,
  ) {
    const payload = {
      email: userWithoutPsw.email,
      isTwoFactorAuthenticationEnabled:
        !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated,
    };

    return {
      email: payload.email,
    };
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.email, 'Yan Odam', secret);

    await this.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpAuthUrl,
    };
  }

  async resendVerifyCode(email: string) {
    this.generateCode();
    const user = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        authConfirmToken: this.generateCode(),
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.sendConfirmationEmail(user).catch((err) => {
      console.log(err);
    });

    return {
      email: user.email,
      message: 'Code has been sent to your email',
      code: user.authConfirmToken,
    };
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorAuthenticationSecret: secret },
    });
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (user.isTwoFactorAuthenticationEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorAuthenticationEnabled: true },
    });
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    try {
      // Of course, we should consider encrypting the password
      const isMatch = pass === user.hash;
      if (user && isMatch) {
        const { hash: _, ...userWithoutPassword } = user;
        delete user.twoFactorAuthenticationSecret;

        return userWithoutPassword;
      }
    } catch (e) {
      return null;
    }
  }

  async verifyAccount(code: number, email: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return new HttpException(
          'Verification code has expired or not found',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (user.verified) {
        return new HttpException(
          'Account already verified',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.authConfirmToken === Number(code)) {
        await this.prisma.user.update({
          where: {
            email,
          },
          data: {
            verified: true,
            authConfirmToken: null,
          },
        });
        await this.sendConfirmedEmail(user);
        return true;
      }
      return false;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendConfirmedEmail(user: User) {
    const { email, displayName, username } = user;
    if (!displayName) {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Yan Odam! Email Confirmed',
        template: 'confirmed',
        context: {
          displayName: username,
          email,
        },
      });
    } else {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Yan Odam! Email Confirmed',
        template: 'confirmed',
        context: {
          displayName,
          email,
        },
      });
    }
  }

  async sendConfirmationEmail(user: User) {
    const { email, displayName } = user;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Yan Odam! Confirm Email',
      template: 'confirm',
      context: {
        displayName,
        code: user.authConfirmToken,
      },
    });
  }

  async verify(token: string): Promise<{ sub: number; email: string }> {
    const secret = this.config.get('JWT_SECRET');

    const payload = await this.jwt.verifyAsync(token, {
      secret: secret,
    });
    return payload;
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };

    const secret = this.config.get('JWT_SECRET');

    // cookie
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_COOKIE_MAX_AGE'),
      secret: secret,
    });
    // Return the token
    return token;
  }

  async signTokenRefresh(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };

    const secret = this.config.get('JWT_REFRESH_SECRET');

    // cookie
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_MAX_AGE'),
      secret: secret,
    });

    await this.prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        jwt_token: token,
      },
    });
    // Return the token
    return token;
  }

  async refresh(token: string) {
    const secret = this.config.get('JWT_REFRESH_SECRET');

    const payload = await this.jwt.verifyAsync(token, {
      secret: secret,
    });
    return await this.signTokenRefresh(payload.sub, payload.email);
  }

  async signTokenCookie(
    userId: number,
    email: string,
    res: Response,
  ): Promise<{ msg: string }> {
    const payload = { sub: userId, email };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_COOKIE_MAX_AGE'),
      secret: secret,
    });
    // Return the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: this.config.get('JWT_COOKIE_MAX_AGE'), // 15 minutes
    });

    res.cookie('auth-cookie', token, { httpOnly: true, secure: true });
    return { msg: 'success' };
  }

  async changePassword(dto: ChangePasswordDto) {
    // Check if the user exists in the database
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Check if the password is correct
    const valid = await argon.verify(user.hash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new UnauthorizedException('Passwords do not match');
    }
    // Generate the pass hash
    const hash = await argon.hash(dto.newPassword);

    // Update the user in the database
    const updatedUser = await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        hash,
      },
    });

    delete updatedUser.hash;
    delete user.twoFactorAuthenticationSecret;

    // Return the user
    return updatedUser;
  }
}
