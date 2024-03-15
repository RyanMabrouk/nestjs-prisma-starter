import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../password.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { SignupInput } from '../dto/signup.input';
import { User } from 'src/users/models/user.model';
import Session from 'prisma/prisma-client';
import { Token } from '../models/token.model';
describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let passwordService: PasswordService;
  let usersService: UsersService;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest
              .fn()
              .mockReturnValue({ userId: 'userId', sessionId: 'sessionId' }),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            validatePassword: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ refreshIn: '1d' }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(new User()),
            findOne: jest.fn().mockResolvedValue(new User()),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            create: jest.fn().mockResolvedValue(Session),
            remove: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    passwordService = module.get<PasswordService>(PasswordService);
    usersService = module.get<UsersService>(UsersService);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  it('should signup a user', async () => {
    const signupInput: SignupInput = {
      email: 'test@example.com',
      password: 'password',
    };
    const token: Token = await authService.signup(signupInput, 'userAgent');
    expect(usersService.create).toHaveBeenCalledWith(signupInput);
    expect(sessionsService.create).toHaveBeenCalledWith({
      userId: 'userId',
      userAgent: 'userAgent',
    });
    expect(token).toEqual({ accessToken: 'token', refreshToken: 'token' });
  });

  it('should login a user', async () => {
    const token: Token = await authService.login({
      email: 'test@example.com',
      password: 'password',
      userAgent: 'userAgent',
    });
    expect(usersService.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(passwordService.validatePassword).toHaveBeenCalledWith(
      'password',
      'hashedPassword',
    );
    expect(sessionsService.create).toHaveBeenCalledWith({
      userId: 'userId',
      userAgent: 'userAgent',
    });
    expect(token).toEqual({ accessToken: 'token', refreshToken: 'token' });
  });

  it('should logout a user', async () => {
    const result = await authService.logout('sessionId');
    expect(sessionsService.remove).toHaveBeenCalledWith({ id: 'sessionId' });
    expect(result).toEqual({ accessToken: '', refreshToken: '' });
  });

  it('should generate tokens', () => {
    const token: Token = authService.generateTokens({
      userId: 'userId',
      sessionId: 'sessionId',
    });
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(token).toEqual({ accessToken: 'token', refreshToken: 'token' });
  });

  it('should refresh a token', async () => {
    const token: Token = await authService.refreshToken('token');
    expect(jwtService.verify).toHaveBeenCalledWith('token', {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    expect(token).toEqual({ accessToken: 'token', refreshToken: 'token' });
  });
});
