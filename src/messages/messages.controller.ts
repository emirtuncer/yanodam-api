import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { MessagesService } from './messages.service';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}
  // @Get()
  // getMe(@GetUser() user: User, @GetUser('id') userId: number) {
  //   return this.messagesService.getMessages(userId);
  // }

  // @Post()
  // createMessage(
  //   @GetUser('id') userId: number,
  //   @Body() to: number,
  //   @Body() text: string,
  // ) {
  //   return this.messagesService.create(userId, to, text);
  // }
}
