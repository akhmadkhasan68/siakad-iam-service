import { IBaseEntity } from './base-entity.interface';

export interface ITokenDenylist extends IBaseEntity {
    jti: string;
    reason?: string;
    expiresAt: Date;
}