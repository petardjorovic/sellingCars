import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../decorators/roles.decorator';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    role: Role;
  };
}

export enum Role {
  ADMIN = 'admin',
  OWNER = 'owner',
  USER = 'user',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    return roles.includes(request.user.role);
  }
}
