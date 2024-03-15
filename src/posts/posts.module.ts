import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [PostsController],
})
export class PostsModule {}
