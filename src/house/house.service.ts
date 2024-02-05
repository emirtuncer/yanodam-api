import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseDto, EditHouseDto } from './dto';

@Injectable()
export class HouseService {
  constructor(private prisma: PrismaService) {}

  getUserHouse(userId: number) {
    return this.prisma.house.findUnique({
      where: {
        userId,
      },
    });
  }

  getHouseById(userId: number, houseId: number) {
    return this.prisma.house.findUnique({
      where: {
        id: houseId,
      },
    });
  }

  async createUserHouse(userId: number, dto: CreateHouseDto) {
    const house = await this.prisma.house.create({
      data: {
        id: userId,
        userId,
        ...dto,
      },
    });

    return house;
  }

  async editUserHouse(userId: number, dto: EditHouseDto) {
    const house = await this.prisma.house.findUnique({
      where: {
        id: userId,
      },
    });
    if (!house || house.userId !== userId) {
      throw new ForbiddenException('Access to resource failed');
    }

    return this.prisma.house.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
  }

  deleteUserHouse(userId: number) {
    return this.prisma.house.delete({
      where: {
        id: userId,
      },
    });
  }
}
