import { SetMetadata } from '@nestjs/common';
import { Role } from '../guards/roles.guard';

export const ROLES = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
