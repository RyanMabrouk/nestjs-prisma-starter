import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/models/user.model';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { SignupInput } from '../dto/signup.input';
import { LoginInput } from '../dto/login.input';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn().mockResolvedValue({
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
            }),
            login: jest.fn().mockResolvedValue({
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
            }),
            logout: jest.fn().mockResolvedValue(null),
            refreshToken: jest.fn().mockResolvedValue({
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should signup a user', async () => {
    const signupInput: SignupInput = {
      email: 'test@example.com',
      password: 'password',
    };
    const result = await authController.signup(signupInput, 'userAgent', {
      cookie: jest.fn(),
    } as any);
    expect(authService.signup).toHaveBeenCalledWith(signupInput, 'userAgent');
    expect(result).toEqual({ status: 'success' });
  });

  it('should login a user', async () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password',
    };
    const result = await authController.login(loginInput, 'userAgent', {
      cookie: jest.fn(),
    } as any);
    expect(authService.login).toHaveBeenCalledWith(loginInput);
    expect(result).toEqual({ status: 'success' });
  });

  it('should logout a user', async () => {
    const user = new User();
    user.sessionId = 'sessionId';
    const result = await authController.remove(user, {
      clearCookie: jest.fn(),
    } as any);
    expect(authService.logout).toHaveBeenCalledWith(user.sessionId);
    expect(result).toEqual({ status: 'success' });
  });

  it('should refresh a token', async () => {
    const cookies = { refreshToken: 'refreshToken' };
    const result = authController.refreshToken(
      { accessToken: '', refreshToken: cookies.refreshToken },
      {
        cookie: jest.fn(),
      } as any,
    );
    expect(authService.refreshToken).toHaveBeenCalledWith(cookies.refreshToken);
    expect(result).toEqual({ status: 'success' });
  });
});
