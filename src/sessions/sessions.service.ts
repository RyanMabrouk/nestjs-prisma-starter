import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/shared/configs/config.interface';
import { Session } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async create({ userId, userAgent }: CreateSessionDto): Promise<Session> {
    return await this.prisma.session.create({
      data: {
        userId,
        userAgent,
        refreshToken: '',
        valid: true,
      },
    });
  }

  async findAll({ userId }: { userId: string }): Promise<Session[]> {
    const expiresInConfig =
      this.configService.get<SecurityConfig>('security').expiresIn;
    const units = this.configService.get<SecurityConfig>('security').units;
    const unit = expiresInConfig.slice(-1);
    const expiresIn = Number(expiresInConfig.slice(0, -1)) * units[unit];
    if (!units[unit] || isNaN(expiresIn)) {
      throw new Error('Invalid expiresIn');
    }
    return await this.prisma.session.findMany({
      where: {
        userId,
        valid: true,
        createdAt: {
          gte: new Date(new Date().getTime() - expiresIn),
        },
      },
    });
  }

  async findOne({ sessionId }: { sessionId: string }): Promise<Session | null> {
    return await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  async remove({ id }: { id: string }): Promise<Session> {
    return await this.prisma.session.update({
      where: {
        id,
      },
      data: {
        valid: false,
      },
    });
  }
  async removeAll({
    sessionId,
    userId,
  }: {
    sessionId: string;
    userId: string;
  }): Promise<{ count: number }> {
    return await this.prisma.session.updateMany({
      where: {
        valid: true,
        userId,
        NOT: {
          id: sessionId,
        },
      },
      data: {
        valid: false,
      },
    });
  }
}
