import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { UserTypeEnum } from '../../../shared/enums/user-type.enum';
import { IGroupMember } from '../interfaces/group-member.interface';
import { IOrganization } from '../interfaces/organization.interface';
import { IRefreshToken } from '../interfaces/refresh-token.interface';
import { ISession } from '../interfaces/session.interface';
import { IUserCredentialPasswordHistory } from '../interfaces/user-credential-password-history.interface';
import { IUserCredentialPassword } from '../interfaces/user-credential-password.interface';
import { IUserEmail } from '../interfaces/user-email.interface';
import { IUserPhone } from '../interfaces/user-phone.interface';
import { IUserRoles } from '../interfaces/user-roles.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { GroupMember } from './group-member.entity';
import { RefreshToken } from './refresh-token.entity';
import { Session } from './session.entity';
import { UserCredentialPasswordHistory } from './user-credential-password-history.entity';
import { UserCredentialPassword } from './user-credential-password.entity';
import { UserEmail } from './user-email.entity';
import { UserPhone } from './user-phone.entity';
import { UserRoles } from './user-roles.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity implements IUser {
    @Column({
        type: 'text',
        nullable: false,
    })
    email: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    fullName: string;

    @Column({
        type: 'varchar',
        nullable: false,
    })
    type: UserTypeEnum;

    @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
    userRoles?: IUserRoles[];

    @OneToMany(() => UserEmail, (email) => email.user)
    emails?: IUserEmail[];

    @OneToMany(() => UserPhone, (phone) => phone.user)
    phones?: IUserPhone[];

    @OneToOne(() => UserCredentialPassword, (password) => password.user)
    credentialPassword?: IUserCredentialPassword;

    @OneToMany(() => UserCredentialPasswordHistory, (history) => history.user)
    credentialPasswordHistory?: IUserCredentialPasswordHistory[];

    @OneToMany(() => Session, (session) => session.user)
    sessions?: ISession[];

    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens?: IRefreshToken[];

    @OneToMany(() => GroupMember, (member) => member.user)
    groupMembers?: IGroupMember[];

    // Many-to-many with organizations through user_organizations table
    organizations?: IOrganization[];
}
