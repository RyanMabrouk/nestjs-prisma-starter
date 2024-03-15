import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../../users/models/user.model';
import { BaseModel } from '../../shared/models/base.model';

export class Post extends BaseModel {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string | null;

  @IsBoolean()
  published: boolean;

  @Type(() => User)
  @IsOptional()
  author?: User | null;
}
