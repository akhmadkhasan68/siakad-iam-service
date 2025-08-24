// permission.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { TAction, TResource } from 'src/shared/constants/permission.constant';
import { PermissionUtil } from 'src/shared/utils/permission.util';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const permission = this.reflector.get<{
            resource: TResource;
            actions: TAction[];
        }>(PERMISSION_KEY, context.getHandler());

        if (!permission) return true; // No permission required

        const request = context.switchToHttp().getRequest();
        const user = request.user as IUser;

        const userPermissions =
            user.userRoles?.flatMap((role) => role.role?.permissions ?? []) ||
            [];

        if (!user || !userPermissions) {
            throw new ForbiddenException('No permissions found.');
        }

        const userPermissionCodes: string[] =
            PermissionUtil.getPermissionsCodes(userPermissions);

        const { resource, actions } = permission;

        const hasAllPermissions = actions.every((action) =>
            userPermissionCodes.includes(
                PermissionUtil.getPermissionSlugByResourceAndOperation(
                    resource,
                    action,
                ),
            ),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('Insufficient permissions.');
        }

        return true;
    }
}
