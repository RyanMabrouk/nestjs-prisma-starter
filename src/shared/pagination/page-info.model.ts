import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class PageInfo {
  @IsString()
  @IsOptional()
  endCursor?: string;

  @IsBoolean()
  hasNextPage: boolean;

  @IsBoolean()
  hasPreviousPage: boolean;

  @IsString()
  @IsOptional()
  startCursor?: string;
}
