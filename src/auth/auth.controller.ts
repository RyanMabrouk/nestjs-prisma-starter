import { Controller, Post, Body, Delete, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { Public } from 'src/shared/decorators/public.decorator';
import { Agent } from 'src/shared/decorators/agent.decorator';
import { UserEntity } from 'src/shared/decorators/user.decorator';
import { User } from 'src/users/models/user.model';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookies } from 'src/shared/decorators/cookies.decorator';
import { Token } from './models/token.model';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  private readonly cookiesConfig =
    this.configService.get<CookieOptions>('cookies');
  @Public()
  @Post('signup')
  async signup(
    @Body() data: SignupInput,
    @Agent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signup(
      data,
      userAgent,
    );
    res.cookie('accessToken', accessToken, this.cookiesConfig);
    res.cookie('refreshToken', refreshToken, this.cookiesConfig);
    return { status: 'success' };
    //return { accessToken, refreshToken };
  }
  @Public()
  @Post('login')
  async login(
    @Body() { email, password }: LoginInput,
    @Agent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login({
      email,
      password,
      userAgent,
    });
    res.cookie('accessToken', accessToken, this.cookiesConfig);
    res.cookie('refreshToken', refreshToken, this.cookiesConfig);
    return { status: 'success' };
    //return { accessToken, refreshToken };
  }
  @Delete('logout')
  async remove(
    @UserEntity() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sessionId);
    res.clearCookie('accessToken', this.cookiesConfig);
    res.clearCookie('refreshToken', this.cookiesConfig);
    return { status: 'success' };
    //return { accessToken, refreshToken };
  }
  @Post('refresh')
  refreshToken(
    @Cookies() cookies: Token,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = this.authService.refreshToken(
      cookies.refreshToken,
    );
    res.cookie('accessToken', accessToken, this.cookiesConfig);
    res.cookie('refreshToken', refreshToken, this.cookiesConfig);
    return { status: 'success' };
    //return { accessToken, refreshToken };
  }
}
