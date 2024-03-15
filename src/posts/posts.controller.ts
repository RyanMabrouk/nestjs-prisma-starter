import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserEntity } from '../shared/decorators/user.decorator';
import { User } from '../users/models/user.model';
import { CreatePostInput } from './dto/createPost.input';

@Controller('posts')
export class PostsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createPost(@UserEntity() user: User, @Body() data: CreatePostInput) {
    return this.prisma.post.create({
      data: {
        published: true,
        title: data.title,
        content: data.content,
        authorId: user.id,
      },
    });
  }

  @Get()
  async publishedPosts() {
    return this.prisma.post.findMany({
      where: { published: true },
      include: { author: true },
    });
  }

  @Get(':userId/userPosts')
  async userPosts(@Param('userId') userId: string) {
    return this.prisma.user
      .findUnique({ where: { id: userId } })
      .posts({ where: { published: true } });
  }

  @Get(':postId')
  async post(@Param('postId') postId: string) {
    return this.prisma.post.findUnique({ where: { id: postId } });
  }
}
