import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { UserWithoutPasswordType } from './users.types';
import { ResponseTemplate } from '../../utils/interceptors/transform.interceptor';
import { UserWithoutPassword } from '../../utils/selector.utils';
import { AllowAnon, UseAuth } from '../auth/auth.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import { encryptData } from '../../utils/encryption.utils';
import { PostWithTagsType } from '../posts/posts.types';
import { PaginatedResult } from '../../lib/prisma/paginator';
import { PostsService } from '../posts/posts.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id', tags: ['users'] })
  @AllowAnon()
  async findById(
    @Param('id') id: string,
  ): Promise<ResponseTemplate<UserWithoutPasswordType>> {
    const user = await this.usersService.getUser({ id }, UserWithoutPassword);
    if (!user) throw new NotFoundException(`No user found with id: ${id}`);

    return { message: 'Retrieved user successfully', result: user };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  @AllowAnon()
  @ApiOperation({ summary: 'Get all posts', tags: ['users'] })
  @ApiQuery({ name: 'page', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async getPosts(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('search') search?: string,
  ): Promise<ResponseTemplate<PaginatedResult<PostWithTagsType>>> {
    const result = await this.postsService.getUserPosts(id, { page, search });
    return { message: "Retrieved user's post successfully", result };
  }

  @HttpCode(HttpStatus.OK)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user', tags: ['users'] })
  async updateCurrentUser(
    @UseAuth() user: UserWithoutPasswordType,
    @Body() data: UpdateUserDto,
  ) {
    const userUpdateData: Prisma.UserUpdateInput = { ...data };

    if (data.password) {
      const encryptedPassword = await encryptData(data.password);
      userUpdateData.password = encryptedPassword;
    }

    return {
      message: 'Updated user successfully',
      result: await this.usersService.updateUser({ id: user.id }, data),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete current user by id',
    tags: ['users'],
  })
  async deleteCurrentUser(
    @UseAuth() user: UserWithoutPasswordType,
  ): Promise<ResponseTemplate<User>> {
    return {
      message: 'Deleted user successfully',
      result: await this.usersService.deleteUser({ id: user.id }),
    };
  }
}
