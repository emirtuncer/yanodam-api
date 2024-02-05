import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { CreateHouseDto, EditHouseDto } from './dto';
import { HouseService } from './house.service';

@UseGuards(JwtGuard)
@Controller('houses')
export class HouseController {
  constructor(private houseService: HouseService) {}

  @Get()
  getUserHouse(@GetUser('id') userId: number) {
    return this.houseService.getUserHouse(userId);
  }

  @Get(':id')
  getUserHouseById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) houseId: number,
  ) {
    return this.houseService.getHouseById(userId, houseId);
  }

  @Post()
  createUserHouse(@GetUser('id') userId: number, @Body() dto: CreateHouseDto) {
    return this.houseService.createUserHouse(userId, dto);
  }

  @Patch()
  editUserHouse(@GetUser('id') userId: number, @Body() dto: EditHouseDto) {
    return this.houseService.editUserHouse(userId, dto);
  }

  @Delete()
  deleteUserHouse(@GetUser('id') userId: number) {
    return this.houseService.deleteUserHouse(userId);
  }
}
