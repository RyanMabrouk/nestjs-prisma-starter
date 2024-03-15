import { Prisma } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../shared/configs/config.interface';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  async signup(payload: SignupInput, userAgent: string): Promise<Token> {
    try {
      const user = await this.usersService.create(payload);
      const session = await this.sessionsService.create({
        userId: user.id,
        userAgent: userAgent,
      });
      return this.generateTokens({
        userId: user.id,
        sessionId: session.id,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  async login({
    email,
    password,
    userAgent,
  }: {
    email: string;
    password: string;
    userAgent: string;
  }): Promise<Token> {
    const user = await this.usersService.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    const session = await this.sessionsService.create({
      userId: user.id,
      userAgent: userAgent,
    });
    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );
    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }
    return this.generateTokens({
      userId: user.id,
      sessionId: session.id,
    });
  }
  async logout(sessionId: string) {
    await this.sessionsService.remove({ id: sessionId });
    return {
      accessToken: '',
      refreshToken: '',
    };
  }

  generateTokens(payload: { userId: string; sessionId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: securityConfig.refreshIn,
    });
  }

  private generateRefreshToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId, sessionId } = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.generateTokens({
        userId,
        sessionId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
