import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interceptors/current-user.interceptor';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    return req.currentUser;
  },
);
