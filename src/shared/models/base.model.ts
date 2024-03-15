import { IsString, IsDate } from 'class-validator';

export abstract class BaseModel {
  @IsString()
  id: string;
  @IsDate()
  createdAt: Date;
  @IsDate()
  updatedAt: Date;
}
