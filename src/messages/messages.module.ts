import { CacheModule, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [CacheModule.register()],
  providers: [
    MessagesService,
    MessagesGateway,
    UserService,
    JwtService,
    PrismaService,
  ],
  controllers: [MessagesController],
})
export class MessagesModule {}
