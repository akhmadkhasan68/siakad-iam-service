import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ISession } from '../interfaces/session.interface';
import { IUser } from '../interfaces/user.interface';
import { IRefreshToken } from '../interfaces/refresh-token.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('sessions')
@Index(['userId'])
export class Session extends BaseEntity implements ISession {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'last_seen_at',
    })
    lastSeenAt?: Date;

    @Column({
        type: 'inet',
        nullable: true,
    })
    ip?: string;

    @Column({
        type: 'text',
        nullable: true,
        name: 'user_agent',
    })
    userAgent?: string;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'revoked_at',
    })
    revokedAt?: Date;

    @ManyToOne(() => User, (user) => user.sessions, {
        onDelete: 'CASCADE',
    })
    user?: IUser;

    // Relations will be added after refresh token entity is created
    refreshTokens?: IRefreshToken[];
}