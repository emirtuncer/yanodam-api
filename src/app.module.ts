import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HouseService } from './house/house.service';
import { HouseModule } from './house/house.module';
import { MulterModule } from '@nestjs/platform-express';
import { HealthModule } from './health/health.module';
import { MessagesModule } from './messages/messages.module';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // CacheModule.register(),
    // CacheModule.register(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <yanodam@gmail.com>',
      },
      template: {
        dir: join(__dirname, '../src/views/email-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    AuthModule,
    UserModule,
    PrismaModule,
    HealthModule,
    HouseModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [HouseService],
})
export class AppModule {}
