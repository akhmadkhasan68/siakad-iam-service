import { IPermission } from 'src/infrastructures/databases/interfaces/permission.interface';
import {
    ACTION,
    PERMISSION_RESOURCE_OPERATION,
    RESOURCE,
    TAction,
    TResource,
} from '../constants/permission.constant';

export const PermissionUtil = {
    getPermissionSlugs: (resource?: TResource) => {
        if (!resource) {
            const resources = Object.keys(
                PERMISSION_RESOURCE_OPERATION,
            ) as TResource[];

            return resources
                .map((resource) => {
                    return PERMISSION_RESOURCE_OPERATION[resource].map(
                        (operation) => {
                            return `${resource}.${operation}`;
                        },
                    );
                })
                .flat();
        }

        return PERMISSION_RESOURCE_OPERATION[resource].map((operation) => {
            return `${resource}.${operation}`;
        });
    },

    getPermissionsCodes: (permissions: IPermission[]) => {
        const slugs = permissions.map((permission) => {
            return PermissionUtil.getPermissionCodes(permission);
        });
        return Array.from(new Set(slugs));
    },

    getPermissionCodes: (permission: IPermission) => {
        return `${permission.resource?.code}.${permission.action?.code}`;
    },

    getResources: () => {
        return Object.keys(PERMISSION_RESOURCE_OPERATION) as TResource[];
    },

    getOperations: (): TAction[] => {
        return Object.values(ACTION) as TAction[];
    },

    getResourceBySlug: (slug: string): TResource | null => {
        const resourceValue = Object.values(RESOURCE).find((resource) =>
            resource.startsWith(slug),
        );

        if (!resourceValue) {
            return null;
        }

        return resourceValue as TResource;
    },

    getOperationBySlug: (slug: string): TAction | null => {
        const operationValue = Object.values(ACTION).find((operation) =>
            operation.startsWith(slug),
        );

        if (!operationValue) {
            return null;
        }

        return operationValue as TAction;
    },

    getPermissionSlugByResourceAndOperation: (
        resource: TResource,
        operation: TAction,
    ) => {
        return `${resource}.${operation}`;
    },
};
