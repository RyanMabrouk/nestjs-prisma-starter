import { IsEnum } from 'class-validator';

enum OrderDirection {
  // Specifies an ascending order for a given `orderBy` argument.
  asc = 'asc',
  // Specifies a descending order for a given `orderBy` argument.
  desc = 'desc',
}
export abstract class Order {
  @IsEnum(OrderDirection)
  direction: OrderDirection;
}
