import { Type } from 'class-transformer';
import { PageInfo } from './page-info.model';

export default function Paginated<TItem>(TItemClass: new () => TItem) {
  abstract class EdgeType {
    cursor: string;
    @Type(() => TItemClass)
    node: TItem;
  }
  abstract class PaginatedType {
    @Type(() => EdgeType)
    edges: Array<EdgeType>;

    @Type(() => PageInfo)
    pageInfo: PageInfo;

    totalCount: number;
  }
  return PaginatedType;
}
