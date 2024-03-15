import { Controller, Get, Put, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserEntity } from 'src/shared/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@UserEntity() user: User): Promise<User> {
    delete user.password;
    return user;
  }

  @Put('me')
  async updateUser(
    @UserEntity() user: User,
    @Body() newUserData: UpdateUserInput,
  ) {
    const updatedUser = await this.usersService.updateUser(
      user.id,
      newUserData,
    );
    delete updatedUser.password;
    return updatedUser;
  }

  @Put('me/password')
  async changePassword(
    @UserEntity() user: User,
    @Body() changePassword: ChangePasswordInput,
  ) {
    const updatedUser = await this.usersService.changePassword(
      user.id,
      user.password,
      changePassword,
    );
    delete updatedUser.password;
    return updatedUser;
  }
}
