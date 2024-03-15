import { IsString } from 'class-validator';
export class CreateSessionDto {
  @IsString()
  userId: string;
  @IsString()
  userAgent: string;
}
