import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from 'nestjs-prisma';
import { PasswordService } from '../../auth/password.service';
import { SignupInput } from 'src/auth/dto/signup.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { ChangePasswordInput } from '../dto/change-password.input';
import { User } from '../models/user.model';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue(new User()),
              findUnique: jest.fn().mockResolvedValue(new User()),
              update: jest.fn().mockResolvedValue(new User()),
            },
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
            validatePassword: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should create a user', async () => {
    const signupInput: SignupInput = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = await usersService.create(signupInput);
    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        ...signupInput,
        password: 'hashedPassword',
        role: 'USER',
      },
    });
    expect(user).toBeDefined();
  });

  it('should find one user', async () => {
    const user = await usersService.findOne({ where: { id: 'userId' } });
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'userId' },
    });
    expect(user).toBeDefined();
  });

  it('should update a user', async () => {
    const updateUserData: UpdateUserInput = {
      email: 'new@example.com',
    };
    const user = await usersService.updateUser('userId', updateUserData);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      data: updateUserData,
      where: { id: 'userId' },
    });
    expect(user).toBeDefined();
  });

  it('should change a user password', async () => {
    const changePasswordInput: ChangePasswordInput = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword',
    };
    const user = await usersService.changePassword(
      'userId',
      'oldPassword',
      changePasswordInput,
    );
    expect(passwordService.validatePassword).toHaveBeenCalledWith(
      'oldPassword',
      'oldPassword',
    );
    expect(prismaService.user.update).toHaveBeenCalledWith({
      data: { password: 'hashedPassword' },
      where: { id: 'userId' },
    });
    expect(user).toBeDefined();
  });
});
