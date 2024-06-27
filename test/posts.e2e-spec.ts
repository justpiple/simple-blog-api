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
import { PostWithTagsAndAuthorType } from 'src/core/posts/posts.types';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: UserWithoutPasswordType;
  let post: PostWithTagsAndAuthorType;
  let accessToken: string;
  const newUser = {
    name: 'TestAcc#2',
    email: 'test2@email.com',
    password: 'Test1234#',
  };

  const newPost = {
    title: 'Post testing#1',
    content: 'Halo ini adalah content',
    published: true,
    slug: 'test-1',
    tags: ['testing'],
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
    await prisma.user.delete({ where: { email: newUser.email } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /v1/posts', () => {
    it('should create a new post', async () => {
      const beforeCount = await prisma.post.count();
      const { status, body } = await request(app.getHttpServer())
        .post(`/v1/posts`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPost);

      post = body.result;
      const afterCount = await prisma.post.count();

      expect(status).toBe(201);
      expect(afterCount - beforeCount).toBe(1);
    });

    it('returns HTTP status 400 for duplicated slug', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(`/v1/posts`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPost);

      expect(status).toBe(400);
      expect(body.message).toContain('Post_slug_key');
    });
  });

  describe('GET /v1/posts', () => {
    it('should return all posts', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/v1/posts`,
      );

      expect(status).toBe(200);
      expect(body.result.data).toEqual(expect.any(Array));
    });

    it('should return posts based on search query', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/v1/posts?search=${newPost.title}`,
      );

      expect(status).toBe(200);
      expect(body.result?.data[0]?.title).toEqual(newPost.title);
    });
  });

  describe('GET /v1/posts/:id', () => {
    it('should return post by id', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/v1/posts/${post.id}`,
      );

      expect(status).toBe(200);
      expect(body.result?.title).toEqual(newPost.title);
    });

    it('returns HTTP status 404 for invalid post id', async () => {
      const { status } = await request(app.getHttpServer()).get(`/v1/posts/0`);

      expect(status).toBe(404);
    });
  });

  describe('PATCH /v1/posts/:id', () => {
    let updatePost = { content: 'Halo ini adalah content updated' };
    it('returns HTTP status 401 for unauthorized user', async () => {
      const { status } = await request(app.getHttpServer())
        .patch(`/v1/posts/${post.id}`)
        .send(updatePost);

      expect(status).toBe(401);
    });

    it('should update post', async () => {
      const { status } = await request(app.getHttpServer())
        .patch(`/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePost);

      expect(status).toBe(200);
      const findPost = await prisma.post.findUnique({ where: { id: post.id } });
      expect(findPost.content).toEqual(updatePost.content);
    });
  });

  describe('DELETE /v1/posts/:id', () => {
    it('returns HTTP status 401 for unauthorized user', async () => {
      const { status } = await request(app.getHttpServer()).delete(
        `/v1/posts/${post.id}`,
      );

      expect(status).toBe(401);
    });

    it('should delete post', async () => {
      const beforeCount = await prisma.post.count();
      const { status } = await request(app.getHttpServer())
        .delete(`/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const afterCount = await prisma.post.count();

      expect(status).toBe(200);
      expect(beforeCount - afterCount).toBe(1);
    });
  });
});
