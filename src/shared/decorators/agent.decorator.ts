import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Agent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.get('user-agent') ?? '';
  },
);
