import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '../user/user.entity';

export const ROLES = 'roles';

export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES, roles);
