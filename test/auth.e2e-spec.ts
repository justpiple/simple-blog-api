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

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const newUser = {
    name: 'TestAcc#1',
    email: 'test3@email.com',
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
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: newUser.email } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /v1/auth/signup', () => {
    it('should create a new user', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(newUser);

      const findUser = await prisma.user.findFirst({
        where: { email: newUser.email },
      });

      expect(status).toBe(201);
      expect(findUser.name).toEqual(newUser.name);
    });

    it('returns HTTP status 403 for existing email', async () => {
      const beforeCount = await prisma.user.count();
      const { status, body } = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(newUser);

      const afterCount = await prisma.user.count();

      expect(status).toBe(403);
      expect(body.message).toEqual(
        `User with email ${newUser.email} already exists`,
      );
      expect(afterCount - beforeCount).toBe(0);
    });
  });

  describe('POST /v1/auth/signin', () => {
    it('should return access token', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/v1/auth/signin')
        .send({ email: newUser.email, password: newUser.password });

      expect(status).toBe(200);
      expect(body.result.name).toEqual(newUser.name);
      expect(body.result.access_token).toEqual(expect.any(String));
    });

    it('returns HTTP status 401 for incorrect email or password', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/v1/auth/signin')
        .send({ email: 'wrong@email.com', password: 'wrongPassword' });

      expect(status).toBe(401);
      expect(body.message).toEqual(`Email or Password is incorrect`);
    });
  });
});
