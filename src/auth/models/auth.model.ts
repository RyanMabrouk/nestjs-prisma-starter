import { Type } from 'class-transformer';
import { User } from '../../users/models/user.model';
import { Token } from './token.model';

export class Auth extends Token {
  @Type(() => User)
  user: User;
}
