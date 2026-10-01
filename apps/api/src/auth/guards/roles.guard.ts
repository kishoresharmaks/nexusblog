import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  EDITOR: 60,
  AUTHOR: 40,
  MODERATOR: 30,
  ANALYST: 20,
  USER: 10,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User has no valid role');
    }

    // SUPER_ADMIN has global access
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userLevel = ROLE_HIERARCHY[user.role as Role] || 0;
    const hasRequiredRole = requiredRoles.some((role) => {
      // Direct role match
      if (user.role === role) return true;
      // Or check hierarchy level for admin actions
      const requiredLevel = ROLE_HIERARCHY[role] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied: Required roles [${requiredRoles.join(', ')}] but user role is '${user.role}'`,
      );
    }

    return true;
  }
}
