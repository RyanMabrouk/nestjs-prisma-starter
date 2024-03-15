import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { JwtStrategy } from './jwt.strategy';
import { Request } from 'express';
import { Token } from './models/token.model';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly jwtStrategy: JwtStrategy,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    if (isPublic) {
      return true;
    }
    //const token = this.extractTokenFromHeader(request);
    const { accessToken, refreshToken } = this.extractJWTFromCookie(
      request.cookies,
    );
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = this.jwtStrategy.validate(payload);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
  /* private extractTokenFromHeader(request: Request): string | undefined {
    const headers = request.headers as { authorization?: string };
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }*/
  private extractJWTFromCookie(cookies: Request['cookies']): Partial<Token> {
    if (cookies && cookies.accessToken && cookies.refreshToken) {
      return {
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken,
      };
    }
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
}
