import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}
