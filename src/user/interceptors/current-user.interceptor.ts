import { Observable } from 'rxjs';
import { User } from '../user.entity';
import { UserService } from './../user.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  currentUser: User;
}

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const { userId } = request.session || {};

    if (userId) {
      const user = await this.userService.findById(userId);
      if (user) {
        request.currentUser = user;
      }
    }

    return next.handle();
  }
}
