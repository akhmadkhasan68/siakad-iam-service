import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    ManyToOne,
} from 'typeorm';
import { HashUtil } from '../../../shared/utils/hash.util';
import { IUserCredentialPassword } from '../interfaces/user-credential-password.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_credential_passwords')
@Index(['userId'], { unique: true }) // one active password per user
export class UserCredentialPassword
    extends BaseEntity
    implements IUserCredentialPassword
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

    @ManyToOne(() => User, (user) => user.credentialPassword, {
        onDelete: 'CASCADE',
    })
    user?: IUser;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password = await HashUtil.hashBcryptPassword(this.password);
        }
    }
}
