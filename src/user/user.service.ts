import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { ChangeProfilePhotoDto } from './dto/change-profile-photo.dto';
import { RegisterUniversityDto } from './dto/register-university-dto';
import exclude from './utils/exclude';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

  async getUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      delete user.hash;
      delete user.jwt_token;
      delete user.refresh_token;
      delete user.authConfirmToken;
      delete user.isTwoFactorAuthenticationEnabled;
      delete user.twoFactorAuthenticationSecret;

      return user;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getOffsetPaginationList(params: {
    skip?: number;
    take?: number;
  }): Promise<User[]> {
    const { skip, take } = params;

    if (isNaN(skip)) {
      const users = await this.prisma.user.findMany({
        take,
      });
      const userWithoutPassword = exclude(users, [
        'hash',
        'jwt_token',
        'refresh_token',
        'authConfirmToken',
      ]);
      return userWithoutPassword;
    } else {
      const users = await this.prisma.user.findMany({
        skip,
        take,
      });
      const userWithoutPassword = exclude(users, [
        'hash',
        'jwt_token',
        'refresh_token',
        'authConfirmToken',
      ]);
      return userWithoutPassword;
    }
  }

  async getCursorPaginationList(params: {
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
  }): Promise<User[]> {
    const { take, cursor } = params;

    const users = await this.prisma.user.findMany({
      take,
      skip: 1,
      cursor,
    });

    const userWithoutPassword = exclude(users, [
      'hash',
      'jwt_token',
      'refresh_token',
      'authConfirmToken',
    ]);
    return userWithoutPassword;
  }

  async getUsers(userCity: string) {
    const users = await this.prisma.user.findMany({
      where: {
        city: userCity,
        active: true,
      },
    });

    const userWithoutPassword = exclude(users, [
      'hash',
      'jwt_token',
      'refresh_token',
      'authConfirmToken',
    ]);
    return userWithoutPassword;
  }

  async getUsersWithHouses(userCity: string) {
    return this.prisma.user.findMany({
      select: {
        active: true,
        House: true,
      },
      where: {
        city: userCity,
      },
    });
  }

  async getProfilePhoto(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profilePhotoUrl: true,
      },
    });
    return {
      success: true,
      message: 'Profile photo found',
      profilePhotoUrl: user.profilePhotoUrl,
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    delete user.hash;
    delete user.jwt_token;
    delete user.refresh_token;
    delete user.authConfirmToken;
    delete user.isTwoFactorAuthenticationEnabled;
    delete user.twoFactorAuthenticationSecret;

    return user;
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
    });

    delete user.hash;
    delete user.jwt_token;
    delete user.refresh_token;
    delete user.authConfirmToken;
    delete user.isTwoFactorAuthenticationEnabled;
    delete user.twoFactorAuthenticationSecret;

    return user;
  }

  // async deleteUser(userId: number) {
  //   await this.prisma.user.delete({
  //     where: { id: userId },
  //   });

  //   this.logger.log(`User ${userId} deleted`);

  //   return 'user deleted';
  // }

  async uploadProfilePhoto(
    userId: number,
    file: Express.Multer.File,
    dto: ChangeProfilePhotoDto,
  ) {
    const profilePhotoUrl = file.filename;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profilePhotoUrl,
        ...dto,
      },
    });

    delete user.hash;
    delete user.jwt_token;
    delete user.refresh_token;
    delete user.authConfirmToken;
    delete user.isTwoFactorAuthenticationEnabled;
    delete user.twoFactorAuthenticationSecret;

    this.logger.log(
      `User ${userId} profile photo updated, ${user.profilePhotoUrl}`,
    );

    return user.profilePhotoUrl;
  }

  async registerUniversity(userId: number, dto: RegisterUniversityDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        university: dto.university,
        faculty: dto.faculty,
        active: true,
      },
    });

    delete updatedUser.hash;
    delete updatedUser.jwt_token;
    delete updatedUser.refresh_token;
    delete updatedUser.authConfirmToken;

    return updatedUser;
  }

  async deleteProfilePhoto(userId: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profilePhotoUrl: null,
      },
    });

    delete user.hash;
    delete user.jwt_token;
    delete user.refresh_token;
    delete user.authConfirmToken;
    delete user.isTwoFactorAuthenticationEnabled;
    delete user.twoFactorAuthenticationSecret;

    this.logger.log(`User ${userId} profile photo deleted`);

    return { message: 'Profile photo deleted' };
  }
}
