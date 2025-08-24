import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IUserPhone } from '../interfaces/user-phone.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_phones')
@Index(['phoneE164'], { unique: true })
export class UserPhone extends BaseEntity implements IUserPhone {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'text',
        name: 'phone_e164',
    })
    phoneE164: string;

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

    @ManyToOne(() => User, (user) => user.phones, {
        onDelete: 'CASCADE',
    })
    user?: IUser;
}