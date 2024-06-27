import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma/prisma.service';
import { useContainer } from 'class-validator';
import { UserWithoutPasswordType } from 'src/core/users/users.types';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: UserWithoutPasswordType;
  let accessToken: string;
  const newUser = {
    name: 'TestAcc#1',
    email: 'test1@email.com',
    password: 'Test1234#',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    if (!user)
      user = await prisma.user.create({
        data: {
          ...newUser,
          password:
            '$2b$11$pZKFMCEFcbML98ILDoExzeKFI/MIjjmQUbLn5GWUkG2B2e6GKUAkG',
        },
      });

    if (!accessToken) {
      const { body } = await request(app.getHttpServer())
        .post('/v1/auth/signin')
        .send(newUser);
      accessToken = body.result.access_token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /v1/users/:id', () => {
    it('should return user data', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/v1/users/${user.id}`,
      );

      expect(status).toBe(200);
      expect(body.result.email).toEqual(user.email);
    });

    it('returns HTTP status 404 for invalid user id', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/v1/users/0`,
      );

      expect(status).toBe(404);
    });
  });

  describe('PATCH /v1/users/me', () => {
    let updateUser = { name: 'TestAcc#1.1' };
    it('returns HTTP status 401 for unauthorized user', async () => {
      const { status } = await request(app.getHttpServer())
        .patch('/v1/users/me')
        .send(updateUser);

      expect(status).toBe(401);
    });

    it('should update current user', async () => {
      const { status } = await request(app.getHttpServer())
        .patch('/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUser);

      expect(status).toBe(200);
      const findUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(findUser.name).toEqual(updateUser.name);
    });
  });

  describe('DELETE /v1/users/me', () => {
    it('returns HTTP status 401 for unauthorized user', async () => {
      const { status } = await request(app.getHttpServer()).delete(
        '/v1/users/me',
      );

      expect(status).toBe(401);
    });

    it('should delete current user', async () => {
      const beforeCount = await prisma.user.count();
      const { status } = await request(app.getHttpServer())
        .delete('/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      const afterCount = await prisma.user.count();

      expect(status).toBe(200);
      expect(beforeCount - afterCount).toBe(1);
    });
  });
});
