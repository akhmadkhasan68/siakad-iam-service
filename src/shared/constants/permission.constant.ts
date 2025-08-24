export const ACTION = {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
    IMPORT: 'import',
} as const;

export type TAction = (typeof ACTION)[keyof typeof ACTION];

export const RESOURCE = {
    USER: 'user',
    ROLE: 'role',
    PERMISSION: 'permission',
    SESSION: 'session',
    ORGANIZATION: 'organization',
    RESOURCE: 'resource',
    GROUP: 'group',
    JWT_KEY: 'jwt_key',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_DENYLIST: 'token_denylist',
};

export type TResource = (typeof RESOURCE)[keyof typeof RESOURCE];

export const PERMISSION_RESOURCE_OPERATION: Record<TResource, TAction[]> = {
    [RESOURCE.USER]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
        ACTION.EXPORT,
        ACTION.IMPORT,
    ],

    [RESOURCE.ROLE]: [ACTION.VIEW, ACTION.CREATE, ACTION.UPDATE, ACTION.DELETE],

    [RESOURCE.PERMISSION]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.SESSION]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.ORGANIZATION]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.RESOURCE]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.GROUP]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.JWT_KEY]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.REFRESH_TOKEN]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],

    [RESOURCE.TOKEN_DENYLIST]: [
        ACTION.VIEW,
        ACTION.CREATE,
        ACTION.UPDATE,
        ACTION.DELETE,
    ],
} as const;
