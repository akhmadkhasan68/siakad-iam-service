import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';
import { ISession } from './session.interface';

export interface IRefreshToken extends IBaseEntity {
    userId: string;
    sessionId: string;
    token: string;
    ip?: string;
    userAgent?: string;
    issuedAt: Date;
    expiresAt: Date;
    revokedAt?: Date;
    user?: IUser;
    session?: ISession;
}
