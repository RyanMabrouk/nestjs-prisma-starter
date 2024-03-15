import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { Post } from '../../posts/models/post.model';
import { BaseModel } from '../../shared/models/base.model';
import { Role } from '@prisma/client';

export class User extends BaseModel {
  @IsEmail()
  email: string;

  @IsOptional()
  firstname?: string;

  @IsOptional()
  lastname?: string;

  @IsEnum(Role)
  role: Role;

  @IsArray()
  @IsOptional()
  @Type(() => Post)
  posts?: Post[] | null;

  @IsString()
  sessionId: string;

  @Exclude()
  password: string;
}
