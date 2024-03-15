import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordService } from '../password.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ bcryptSaltOrRound: 10 }),
          },
        },
      ],
    }).compile();

    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should validate a password', async () => {
    const isValid = await passwordService.validatePassword(
      'password',
      'hashedPassword',
    );
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    expect(isValid).toBe(true);
  });

  it('should hash a password', async () => {
    const hashedPassword = await passwordService.hashPassword('password');
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(hashedPassword).toBe('hashedPassword');
  });
});
