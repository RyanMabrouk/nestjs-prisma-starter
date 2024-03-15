import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtDto } from './dto/jwt.dto';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }
  async validate({
    userId,
    sessionId,
  }: JwtDto): Promise<User & { sessionId: string }> {
    const [user, session] = await Promise.all([
      this.usersService.findOne({ where: { id: userId } }),
      this.sessionsService.findOne({ sessionId }),
    ]);
    if (!user || !session || !session.valid) {
      throw new UnauthorizedException();
    }
    return { ...user, sessionId };
  }
}
