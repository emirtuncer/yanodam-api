import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { CreateHouseDto, EditHouseDto } from '../src/house/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';
import { cleanImages } from './clean-images.utils';
// import * as WebSocket from 'ws';
// import { WsAdapter } from '@nestjs/platform-ws';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    // app.useWebSocketAdapter(new WsAdapter(app));

    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    await prisma.cleanDb();

    cleanImages();

    // pactum config
    pactum.request.setBaseUrl(config.get('TEST_BASE_URL'));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto = {
      email: process.env.TEST_USER_1_EMAIL,
      password: process.env.TEST_USER_1_PASSWORD,
      username: process.env.TEST_USER_1_USERNAME,
      city: process.env.TEST_USER_1_CITY,
    };

    const dto2 = {
      email: process.env.TEST_USER_2_EMAIL,
      password: process.env.TEST_USER_2_PASSWORD,
      username: process.env.TEST_USER_2_USERNAME,
      city: process.env.TEST_USER_2_CITY,
    };

    const newPasswordDto = {
      email: dto.email,
      password: dto.password,
      newPassword: process.env.TEST_NEW_PASSWORD,
      newPasswordConfirm: process.env.TEST_NEW_PASSWORD,
    };

    describe('Signup', () => {
      it('should throw error for email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error for password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error no dto', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('should signup a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should signup second user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto2)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should throw error for email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error for password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error no dto', () => {
        return pactum.spec().post('/auth/login').withBody({}).expectStatus(400);
      });

      it('should login a user', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });

      it('should change password', () => {
        return pactum
          .spec()
          .post('/auth/change-password')
          .withBody(newPasswordDto)
          .expectStatus(201);
      });

      it('should login after password changed', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
            password: newPasswordDto.newPassword,
          })
          .expectStatus(200)
          .stores('accessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Current User', () => {
      it('get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .stores('userId', 'id');
      });

      it('should edit user', () => {
        const dto: EditUserDto = {
          name: 'test',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.name);
      });
    });

    describe('Should register university', () => {
      it('should register university', () => {
        return pactum
          .spec()
          .post('/users/register-university')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody({
            university: 'test',
            faculty: 'test',
          })
          .expectStatus(201);
      });
    });

    describe('Upload Profile Photo', () => {
      it('should not allow for not image uploads', () => {
        return pactum
          .spec()
          .post('/users/upload')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withFile('image', './package.json')
          .expectStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
          .expectBodyContains('Unsupported Media Type');
      });

      it('should allow for image file upload --- png ---', () => {
        return pactum
          .spec()
          .post('/users/upload')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withFile('image', './test/test-data/test.png')
          .expectStatus(201);
      });

      it('should allow for image file upload --- jpg ---', () => {
        return pactum
          .spec()
          .post('/users/upload')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withFile('image', './test/test-data/test.jpg')
          .expectStatus(201);
      });

      it('should allow for image file upload --- jpeg ---', () => {
        return pactum
          .spec()
          .post('/users/upload')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withFile('image', './test/test-data/test.jpeg')
          .expectStatus(201);
      });

      // it('should delete profile photo', () => {
      //   return pactum
      //     .spec()
      //     .post('/users/delete-profile-photo')
      //     .withHeaders({
      //       Authorization: `Bearer $S{accessToken}`,
      //     })
      //     .expectStatus(200)
      //     .expectJsonMatch({
      //       message: 'Profile photo deleted',
      //     });
      // });
    });

    describe('User Releations', () => {
      it('get another user', () => {
        return pactum
          .spec()
          .get('/users/$S{userId}')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200);
      });

      it("get another user's profile pic", () => {
        return pactum
          .spec()
          .get('/users/$S{userId}/profile-photo')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains('.jpeg' || '.png' || '.jpg');
      });
    });
  });

  describe('Houses', () => {
    describe("Get user's house", () => {
      it('get empty house', () => {
        return pactum
          .spec()
          .get('/houses')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .expectBody('');
      });
    });

    describe('Create house', () => {
      it('should create house', () => {
        const dto: CreateHouseDto = {
          peopleCount: 2,
          rooms: 2,
          bathrooms: 1,
          rentCost: 300,
          totalFloor: 7,
          floor: 1,
        };
        return pactum
          .spec()
          .post('/houses')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('houseId', 'id');
      });
    });

    describe("Get user's house", () => {
      it("get user's house", () => {
        return pactum
          .spec()
          .get('/houses')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200);
      });
    });

    describe('Get house by userId', () => {
      it('get user house by userId', () => {
        return pactum
          .spec()
          .get('/houses/{id}')
          .withPathParams('id', '$S{houseId}')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains('userId');
      });
    });

    describe('Edit house', () => {
      it('should edit house', () => {
        const dto: EditHouseDto = {
          peopleCount: 2,
          rooms: 2,
          bathrooms: 1,
          rentCost: 300,
          totalFloor: 7,
          floor: 1,
        };

        return pactum
          .spec()
          .patch('/houses')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('Delete house', () => {
      it('should delete house', () => {
        return pactum
          .spec()
          .delete('/houses')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200);
      });
    });
  });

  describe('Messaging', () => {
    // it('should get messages of user', () => {
    //   return pactum
    //     .spec()
    //     .get('/messages')
    //     .withHeaders({
    //       Authorization: `Bearer $S{accessToken}`,
    //     })
    //     .expectStatus(200)
    //     .inspect();
    // });
  });

  describe('User interactions', () => {
    it.todo("should get user's last interactions");
    it.todo('should send friend request to another user');
    it.todo('should remove friendship');
    it.todo('should send block another user');
    it.todo('should send unblock another user');
  });
});
