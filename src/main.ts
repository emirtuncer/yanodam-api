import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import * as csurf from 'csurf';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // cors: true,
  });
  const port = process.env.PORT || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(compression());

  app.disable('x-powered-by'); // NOTE: SECURITY removes x-powered-by header

  // app.use(
  //   helmet({
  //     referrerPolicy: { policy: 'no-referrer' },
  //     noSniff: true,
  //     hidePoweredBy: true,
  //     contentSecurityPolicy: {
  //       directives: {
  //         defaultSrc: ["'self'"],
  //         styleSrc: ["'self'", 'fonts.googleapis.com'],
  //         scriptSrc: ["'self'"],
  //         fontSrc: ["'self'"],
  //         imgSrc: ["'self'", 'data:'],
  //         objectSrc: ["'none'"],
  //         frameSrc: ["'none'"],
  //         mediaSrc: ["'none'"],
  //         connectSrc: ["'self'"],
  //         baseUri: ["'self'"],
  //         formAction: ["'self'"],
  //         frameAncestors: ["'none'"],
  //       },
  //     },
  //   }),
  // );

  process.env.NODE_ENV === 'production' &&
    app.use(csurf({ cookie: { key: '_csrf', sameSite: true, secure: true } })); // NOTE: SECURITY enable csurf

  // process.env.NODE_ENV === 'production'
  //   ? app.enableCors({
  //       origin: ['https://yanodam.com'],
  //       methods: ['GET', 'POST'],
  //       allowedHeaders: [
  //         'Content-Type',
  //         'X-CSRF-TOKEN',
  //         'Access-Control-Allow-Origin',
  //         'access-control-allow-methods',
  //         'Access-Control-Allow-Origin',
  //         'access-control-allow-credentials',
  //         'access-control-allow-headers',
  //       ],
  //       credentials: true,
  //     })
  //   : app.enableCors({
  //       origin: '*',
  //       methods: ['GET', 'POST'],
  //       allowedHeaders: [
  //         'Content-Type',
  //         'X-CSRF-TOKEN',
  //         'Access-Control-Allow-Origin',
  //         'access-control-allow-methods',
  //         'Access-Control-Allow-Origin',
  //         'access-control-allow-credentials',
  //         'access-control-allow-headers',
  //       ],
  //       credentials: true,
  //     });

  // // Rendering Engine
  // app.useStaticAssets(join(__dirname, '..', './src/static'));
  // app.setBaseViewsDir(join(__dirname, '..', './src/views'));
  // app.setViewEngine('ejs');

  //Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Yan Odam API')
    .setDescription('Yan Odam API description')
    .setVersion('1.0')
    .addTag('yanodam')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`The DB connection URL is ${process.env.DATABASE_URL}`);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
