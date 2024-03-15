import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from '../models/user.model';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateUser: jest.fn().mockResolvedValue(new User()),
            changePassword: jest.fn().mockResolvedValue(new User()),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersController = module.get<UsersController>(UsersController);
  });

  it('should return the user without the password', async () => {
    const user = new User();
    user.password = 'password';
    expect(await usersController.me(user)).not.toHaveProperty('password');
  });

  it('should update the user', async () => {
    const user = new User();
    const newUserData = { email: 'new@example.com' };
    await usersController.updateUser(user, newUserData);
    expect(usersService.updateUser).toHaveBeenCalledWith(user.id, newUserData);
  });

  it('should change the user password', async () => {
    const user = new User();
    const changePasswordInput = { oldPassword: 'old', newPassword: 'new' };
    await usersController.changePassword(user, changePasswordInput);
    expect(usersService.changePassword).toHaveBeenCalledWith(
      user.id,
      user.password,
      changePasswordInput,
    );
  });
});
