import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Prisma, Post as PostModel } from '@prisma/client';
import { PostWithTagsAndAuthorType } from './posts.types';
import { ResponseTemplate } from '../../utils/interceptors/transform.interceptor';
import { PostWithTagsAndAuthor } from '../../utils/selector.utils';
import { AllowAnon, UseAuth } from '../auth/auth.decorator';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostsService } from './posts.service';
import { UserWithoutPasswordType } from '../users/users.types';
import { PaginatedResult } from '../../lib/prisma/paginator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @AllowAnon()
  @ApiOperation({ summary: 'Get all posts', tags: ['posts'] })
  @ApiQuery({ name: 'page', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async getPosts(
    @Query('page') page?: number,
    @Query('search') search?: string,
  ): Promise<ResponseTemplate<PaginatedResult<PostWithTagsAndAuthorType>>> {
    const result = await this.postsService.getPosts({ page, search });
    return { message: 'Retrieved post successfully', result };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':slug')
  @AllowAnon()
  @ApiOperation({ summary: 'Get a post by slug or id', tags: ['posts'] })
  async findById(
    @Param('slug') slug: string,
  ): Promise<ResponseTemplate<PostWithTagsAndAuthorType>> {
    const result = await this.postsService.getPost(
      { OR: [{ id: slug }, { slug }] },
      PostWithTagsAndAuthor,
    );
    if (!result)
      throw new NotFoundException(`No post found with slug or id: ${slug}`);

    return { message: 'Retrieved post successfully', result: result };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create post', tags: ['posts'] })
  @ApiBearerAuth()
  async createPost(
    @UseAuth() user: UserWithoutPasswordType,
    @Body() data: UpdatePostDto,
  ) {
    try {
      const postPostData = {
        ...data,
        authorId: user.id,
      } as Prisma.PostUncheckedCreateInput;

      if (data.tags) {
        const mappingTags: Prisma.TagCreateOrConnectWithoutPostsInput[] =
          data.tags.map((tag) => ({
            where: { tagName: tag },
            create: { tagName: tag },
          }));
        postPostData.tags = { connectOrCreate: mappingTags };
      }

      return {
        message: 'Post created successfully',
        result: await this.postsService.createPost(postPostData),
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            `${e?.meta?.target || 'Key'} already exists`,
          );
        }
      }
      throw e;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({ summary: 'Update post by id', tags: ['posts'] })
  @ApiBearerAuth()
  async updateById(
    @Param('id') id: string,
    @UseAuth() user: UserWithoutPasswordType,
    @Body() data: UpdatePostDto,
  ) {
    const findPost = await this.postsService.getPost({ id });

    if (!findPost) throw new NotFoundException(`No post found with id: ${id}`);

    if (findPost.authorId !== user.id)
      throw new UnauthorizedException(`You are not the author of this post`);

    const postPostData = { ...data } as Prisma.PostUncheckedUpdateInput;

    if (data.tags) {
      const mappingTags: Prisma.TagCreateOrConnectWithoutPostsInput[] =
        data.tags.map((tag) => ({
          where: { tagName: tag },
          create: { tagName: tag },
        }));
      postPostData.tags = { connectOrCreate: mappingTags };
    }
    return {
      message: 'Updated post successfully',
      result: await this.postsService.updatePost({ id }, postPostData),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete posts by id',
    tags: ['posts'],
  })
  @ApiBearerAuth()
  async deleteById(
    @Param('id') id: string,
    @UseAuth() user: UserWithoutPasswordType,
  ): Promise<ResponseTemplate<PostModel>> {
    const findPost = await this.postsService.getPost({ id });

    if (!findPost) throw new NotFoundException(`No post found with id: ${id}`);

    if (findPost.authorId !== user.id)
      throw new UnauthorizedException(`You are not the author of this post`);

    return {
      message: 'Deleted post successfully',
      result: await this.postsService.deletePost({ id }),
    };
  }
}
