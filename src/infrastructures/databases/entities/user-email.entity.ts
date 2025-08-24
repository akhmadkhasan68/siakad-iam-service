import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IUserEmail } from '../interfaces/user-email.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_emails')
@Index(['email'], { unique: true })
export class UserEmail extends BaseEntity implements IUserEmail {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'text',
    })
    email: string;

    @Column({
        type: 'boolean',
        default: false,
        name: 'is_primary',
    })
    isPrimary: boolean;

    @Column({
        type: 'boolean',
        default: false,
        name: 'is_verified',
    })
    isVerified: boolean;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: 'verified_at',
    })
    verifiedAt?: Date;

    @ManyToOne(() => User, (user) => user.emails, {
        onDelete: 'CASCADE',
    })
    user?: IUser;
}