import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../decorators/roles.decorator';
import { Request } from 'express';
import { User } from '../user/user.entity';

interface UserWithRole extends User {
  role: Role;
}

export interface RequestWithUserRole extends Request {
  user: UserWithRole;
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
    const request = context.switchToHttp().getRequest<RequestWithUserRole>();
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
