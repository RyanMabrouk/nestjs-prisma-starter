import { Type } from 'class-transformer';
import PaginatedResponse from '../../shared/pagination/pagination';
import { Post } from './post.model';

export class PostConnection extends PaginatedResponse(Post) {
  @Type(() => Post)
  nodes: Post[];
}
