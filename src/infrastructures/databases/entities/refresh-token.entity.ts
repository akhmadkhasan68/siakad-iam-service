import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IRefreshToken } from '../interfaces/refresh-token.interface';
import { IUser } from '../interfaces/user.interface';
import { ISession } from '../interfaces/session.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Session } from './session.entity';

@Entity('refresh_tokens')
@Index(['userId', 'sessionId'], { unique: true }) // composite unique index
export class RefreshToken extends BaseEntity implements IRefreshToken {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'uuid',
        name: 'session_id',
    })
    sessionId: string;

    @Column({
        type: 'text',
    })
    token: string;

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
        default: () => 'NOW()',
        name: 'issued_at',
    })
    issuedAt: Date;

    @Column({
        type: 'timestamptz',
        name: 'expires_at',
    })
    expiresAt: Date;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'revoked_at',
    })
    revokedAt?: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: 'CASCADE',
    })
    user?: IUser;

    @ManyToOne(() => Session, (session) => session.refreshTokens, {
        onDelete: 'CASCADE',
    })
    session?: ISession;
}