import { IsString } from 'class-validator';
export class Token {
  @IsString()
  accessToken: string;
  @IsString()
  refreshToken: string;
}
