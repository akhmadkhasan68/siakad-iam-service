import { IJwtKey } from 'src/infrastructures/databases/interfaces/jwt-key.interface';

export class JwtKeyV1Response {
    id: string;
    kid: string;
    alg: string;
    publicJwk?: any;
    isActive: boolean;
    note?: string;
    rotatedAt?: Date;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    static FromEntity(entity: IJwtKey): JwtKeyV1Response {
        return {
            id: entity.id,
            kid: entity.kid,
            alg: entity.alg,
            publicJwk: entity.publicJwk,
            isActive: entity.isActive,
            note: entity.note,
            rotatedAt: entity.rotatedAt,
            expiresAt: entity.expiresAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static MapEntities(entities: IJwtKey[]): JwtKeyV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}