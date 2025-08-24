import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IUserCredentialPasswordHistory } from '../interfaces/user-credential-password-history.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_credential_password_history')
@Index(['userId', 'createdAt']) // composite index for user password history
export class UserCredentialPasswordHistory
    extends BaseEntity
    implements IUserCredentialPasswordHistory
{
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'text',
    })
    password: string;

    @ManyToOne(() => User, (user) => user.credentialPasswordHistory, {
        onDelete: 'CASCADE',
    })
    user?: IUser;
}
