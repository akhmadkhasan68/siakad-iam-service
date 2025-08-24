import { ISession } from 'src/infrastructures/databases/interfaces/session.interface';

export class SessionV1Response {
    id: string;
    userId: string;
    ip?: string;
    userAgent?: string;
    revokedAt?: Date;
    lastSeenAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    static FromEntity(entity: ISession): SessionV1Response {
        return {
            id: entity.id,
            userId: entity.userId,
            ip: entity.ip,
            userAgent: entity.userAgent,
            revokedAt: entity.revokedAt,
            lastSeenAt: entity.lastSeenAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static MapEntities(entities: ISession[]): SessionV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}