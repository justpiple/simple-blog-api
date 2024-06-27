import { Module } from '@nestjs/common';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PostsService } from '../posts/posts.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, PostsService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
