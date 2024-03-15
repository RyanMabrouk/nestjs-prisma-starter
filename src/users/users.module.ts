import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';

@Module({
  imports: [],
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
})
export class UsersModule {}
