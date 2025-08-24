import { Column, Entity, Index } from 'typeorm';
import { ITokenDenylist } from '../interfaces/token-denylist.interface';
import { BaseEntity } from './base.entity';

@Entity('token_denylist')
@Index(['jti'], { unique: true })
@Index(['expiresAt'])
export class TokenDenylist extends BaseEntity implements ITokenDenylist {
    @Column({
        type: 'uuid',
    })
    jti: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    reason?: string;

    @Column({
        type: 'timestamptz',
        name: 'expires_at',
    })
    expiresAt: Date;
}