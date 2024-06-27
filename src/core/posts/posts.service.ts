import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { PostWithTagsAndAuthorType, PostWithTagsType } from './posts.types';
import {
  PostWithTags,
  PostWithTagsAndAuthor,
} from '../../utils/selector.utils';
import { paginator } from '../../lib/prisma/paginator';

const paginate = paginator({ perPage: 10 });

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPosts({
    where,
    orderBy,
    page,
    search,
  }: {
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    page?: number;
    search?: string;
  }) {
    const searchClause: Prisma.PostWhereInput = search
      ? {
          OR: [
            {
              title: {
                contains: search,
              },
            },
            {
              tags: {
                some: {
                  tagName: {
                    contains: search,
                  },
                },
              },
            },
            {
              author: {
                name: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {};

    return await paginate<PostWithTagsAndAuthorType, Prisma.PostFindManyArgs>(
      this.prismaService.post,
      { page },
      {
        where: {
          ...where,
          ...searchClause,
        },
        orderBy,
        select: PostWithTagsAndAuthor,
      },
    );
  }

  async getUserPosts(
    authorId: string,
    {
      where,
      orderBy,
      page,
      search,
    }: {
      where?: Prisma.PostWhereInput;
      orderBy?: Prisma.PostOrderByWithRelationInput;
      page?: number;
      search?: string;
    },
  ) {
    const searchClause: Prisma.PostWhereInput = search
      ? {
          OR: [
            {
              title: {
                contains: search,
              },
            },
            {
              tags: {
                some: {
                  tagName: {
                    contains: search,
                  },
                },
              },
            },
            {
              author: {
                name: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {};

    return await paginate<PostWithTagsType, Prisma.PostFindManyArgs>(
      this.prismaService.post,
      { page },
      {
        where: {
          authorId,
          ...where,
          ...searchClause,
        },
        orderBy,
        select: PostWithTags,
      },
    );
  }

  async getPost(where: Prisma.PostWhereInput, select?: Prisma.PostSelect) {
    return await this.prismaService.post.findFirst({
      where,
      select,
    });
  }

  async createPost(data: Prisma.PostCreateInput) {
    return await this.prismaService.post.create({
      data,
    });
  }

  async updatePost(
    where: Prisma.PostWhereUniqueInput,
    data: Prisma.PostUpdateInput,
  ) {
    return await this.prismaService.post.update({ where, data });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput) {
    return await this.prismaService.post.delete({ where });
  }
}
