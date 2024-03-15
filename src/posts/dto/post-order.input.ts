import { IsEnum } from 'class-validator';
import { Order } from '../../shared/order/order';

export enum PostOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  published = 'published',
  title = 'title',
  content = 'content',
}

export class PostOrder extends Order {
  @IsEnum(PostOrderField)
  field: PostOrderField;
}
