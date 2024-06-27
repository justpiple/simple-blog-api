import { Module } from '@nestjs/common';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [PrismaModule],
  providers: [PostsService],
  exports: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
