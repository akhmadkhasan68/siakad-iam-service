import { IBaseEntity } from './base-entity.interface';

export interface IJwtKey extends IBaseEntity {
    kid: string;
    alg: string;
    publicJwk?: object;
    isActive: boolean;
    note?: string;
    rotatedAt?: Date;
    expiresAt?: Date;
}
