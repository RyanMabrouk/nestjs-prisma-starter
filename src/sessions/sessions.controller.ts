import { Controller, Delete, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { UserEntity } from 'src/shared/decorators/user.decorator';
import { User } from 'src/users/models/user.model';

@Controller('')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}
  @Get('session/me')
  findOne(@UserEntity() user: User) {
    return this.sessionsService.findOne({ sessionId: user.sessionId });
  }
  @Get('sessions/me')
  findAll(@UserEntity() user: User) {
    return this.sessionsService.findAll({ userId: user.id });
  }
  @Delete('sessions/me')
  async remove(@UserEntity() user: User) {
    const { count } = await this.sessionsService.removeAll({
      sessionId: user.sessionId,
      userId: user.id,
    });
    return { status: 'success', count };
  }
}
