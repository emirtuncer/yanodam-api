import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateMessageDto } from './dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager,
  ) {}

  clientToUser = {};

  async create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {
      text: createMessageDto.text,
      userId: this.clientToUser[clientId],
      ...createMessageDto,
    };
    if (!message.userId) {
      console.log('no user id');
      return false;
    }

    if (!message.text) {
      console.log('no text');
      return false;
    }

    // const { to, from } = createMessageDto;
    // await this.checkIfUsersExist(from, to);

    message.delivered = true;
    message.seen = false;

    // this.messages.push(message); // add to postgresql

    return message;
  }

  getClientName(clientId: string) {
    return this.clientToUser[clientId];
  }

  // async getMessages(userId: number) {
  //   const messages = await this.prismaService.message.findMany({
  //     where: {
  //       userId,
  //     },
  //   });
  //   return messages;
  // }

  // async createMessage(userId: number, to: number, text: string) {
  //   const message = await this.prismaService.message.create({
  //     data: {
  //       text,
  //       userId,
  //       to,
  //     },
  //   });

  //   return message;
  // }

  // private async getRecipientToken(userId: number): Promise<boolean> {
  //   return this.cacheManager.get(userId);
  // }

  private async checkIfUsersExist(from: number, to: number): Promise<void> {
    if (!(await this.userService.getUser(to))) {
      throw new HttpException(
        "Receiver of the message doesn't exist in the system",
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(await this.userService.getUser(from))) {
      throw new HttpException(
        "Sender of the message doesn't exist in the system",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  identify(userId: string, clientId: string) {
    this.clientToUser[clientId] = userId;

    return Object.values(this.clientToUser);
  }
}
