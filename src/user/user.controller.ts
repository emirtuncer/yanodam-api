import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { JwtGuard } from '../auth/guard';
import { ChangeProfilePhotoDto } from './dto/change-profile-photo.dto';
import { UserService } from './user.service';
import { imageFileFilter } from './utils/image-file-filter.utils';
import { extname } from 'path';
import { RegisterUniversityDto } from './dto/register-university-dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    // const { hash: _, ...userWithoutPassword } = user;
    delete user.hash;
    delete user.authConfirmToken;
    delete user.twoFactorAuthenticationSecret;

    return user;
  }

  @Post('register-university')
  registerUniversity(
    @GetUser('id') userId: number,
    @Body() dto: RegisterUniversityDto,
  ) {
    return this.userService.registerUniversity(userId, dto);
  }

  @Get('users-offset')
  async getUserListWithOffset(
    @Query('skip') skip: string,
    @Query('take') take: string,
  ): Promise<User[]> {
    return this.userService.getOffsetPaginationList({
      skip: Number(skip),
      take: Number(take),
    });
  }

  @Get('users-cursor')
  async getUserListWithCursor(
    @Query('take') take: string,
    @Query('cursor') cursor: string,
  ): Promise<User[]> {
    return this.userService.getCursorPaginationList({
      take: Number(take),
      cursor: { id: Number(cursor) },
    });
  }

  @Get('/:id')
  getUser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getUser(userId);
  }

  @Get('/:id/profile-photo')
  getProfilePhoto(
    @Param('id', ParseIntPipe)
    userId: number,
  ) {
    return this.userService.getProfilePhoto(userId);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          cb(null, uuidv4() + extname(file.originalname));
        },
      }),
    }),
  )
  uploadProfilePhoto(
    @GetUser() user: User,
    @Body() dto: ChangeProfilePhotoDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE, // 415
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadProfilePhoto(user.id, file, dto);
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: User) {
    return this.userService.editUser(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete-profile-photo')
  deleteProfilePhoto(@GetUser('id') userId: number) {
    return this.userService.deleteProfilePhoto(userId);
  }

  // @Delete()
  // deleteUser(@GetUser('id') userId: number) {
  //   return this.userService.deleteUser(userId);
  // }
}
