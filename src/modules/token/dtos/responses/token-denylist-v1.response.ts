import { ITokenDenylist } from 'src/infrastructures/databases/interfaces/token-denylist.interface';

export class TokenDenylistV1Response {
    id: string;
    jti: string;
    reason?: string;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;

    static FromEntity(entity: ITokenDenylist): TokenDenylistV1Response {
        return {
            id: entity.id,
            jti: entity.jti,
            reason: entity.reason,
            expiresAt: entity.expiresAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static MapEntities(entities: ITokenDenylist[]): TokenDenylistV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
