import { IsNumber, IsString, IsOptional } from 'class-validator';

export class PaginationArgs {
  @IsNumber()
  @IsOptional()
  skip?: number;

  @IsString()
  @IsOptional()
  after?: string;

  @IsString()
  @IsOptional()
  before?: string;

  @IsNumber()
  @IsOptional()
  first?: number;

  @IsNumber()
  @IsOptional()
  last?: number;
}
