import { PrismaService } from 'nestjs-prisma';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { SignupInput } from 'src/auth/dto/signup.input';
import { Prisma, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async create(payload: SignupInput): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );
    return await this.prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        role: 'USER',
      },
    });
  }
  async findOne(
    query: Prisma.UserFindUniqueArgs<DefaultArgs>,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique(query);
  }
  async updateUser(
    userId: string,
    newUserData: UpdateUserInput,
  ): Promise<User> {
    return await this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
    });
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordInput,
  ): Promise<User> {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword,
    );
    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }
    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword,
    );
    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }
}
