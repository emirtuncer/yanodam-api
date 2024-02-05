import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
// import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { WsGuard } from '../auth/guard/ws.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: {
    // origin: ['http://localhost:3000', 'http://127.0.0.1:5173'],
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'X-CSRF-TOKEN',
      'Access-Control-Allow-Origin',
      'access-control-allow-methods',
      'Access-Control-Allow-Origin',
      'access-control-allow-credentials',
      'access-control-allow-headers',
    ],
    credentials: true,
  },
  cookie: {
    key: '_csrf',
    sameSite: true,
    httpOnly: true,
    secure: true,
  },
})
export class MessagesGateway {
  @WebSocketServer() server: Server;
  constructor(private messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.create(
      createMessageDto,
      client.id,
    );

    this.server.emit('message', message);

    return message;
  }

  @SubscribeMessage('connect')
  connect(@ConnectedSocket() client: Socket) {
    return client.id;
  }

  @SubscribeMessage('disconnect')
  disconnect(@ConnectedSocket() client: Socket) {
    return client.id;
  }

  // @SubscribeMessage('findAllMessages')
  // findAll() {
  //   return this.messagesService.findAll();
  // }

  @SubscribeMessage('join')
  join(
    @MessageBody('userId') userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.messagesService.identify(userId, client.id);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = await this.messagesService.getClientName(client.id);

    client.broadcast.emit('typing', { userId, isTyping });
  }
}
