import { Column, Entity, Index } from 'typeorm';
import { IJwtKey } from '../interfaces/jwt-key.interface';
import { BaseEntity } from './base.entity';

@Entity('jwt_keys')
@Index(['kid', 'isActive']) // composite index
@Index(['isActive'])
export class JwtKey extends BaseEntity implements IJwtKey {
    @Column({
        type: 'text',
        unique: true,
    })
    kid: string;

    @Column({
        type: 'text',
    })
    alg: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        name: 'public_jwk',
    })
    publicJwk?: object;

    @Column({
        type: 'boolean',
        default: true,
        name: 'is_active',
    })
    isActive: boolean;

    @Column({
        type: 'text',
        nullable: true,
    })
    note?: string;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'rotated_at',
    })
    rotatedAt?: Date;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'expires_at',
    })
    expiresAt?: Date;
}