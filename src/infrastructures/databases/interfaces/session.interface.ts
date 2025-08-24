import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';
import { IRefreshToken } from './refresh-token.interface';

export interface ISession extends IBaseEntity {
    userId: string;
    lastSeenAt?: Date;
    ip?: string;
    userAgent?: string;
    revokedAt?: Date;
    user?: IUser;
    refreshTokens?: IRefreshToken[];
}