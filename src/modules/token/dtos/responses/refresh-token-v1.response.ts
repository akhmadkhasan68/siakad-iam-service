import { IRefreshToken } from 'src/infrastructures/databases/interfaces/refresh-token.interface';

export class RefreshTokenV1Response {
    id: string;
    userId: string;
    sessionId: string;
    ip?: string;
    userAgent?: string;
    issuedAt: Date;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    static FromEntity(entity: IRefreshToken): RefreshTokenV1Response {
        return {
            id: entity.id,
            userId: entity.userId,
            sessionId: entity.sessionId,
            ip: entity.ip,
            userAgent: entity.userAgent,
            issuedAt: entity.issuedAt,
            expiresAt: entity.expiresAt,
            revokedAt: entity.revokedAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static MapEntities(entities: IRefreshToken[]): RefreshTokenV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}