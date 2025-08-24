import { UserTypeEnum } from '../../../shared/enums/user-type.enum';
import { IBaseEntity } from './base-entity.interface';
import { IGroupMember } from './group-member.interface';
import { IOrganization } from './organization.interface';
import { IRefreshToken } from './refresh-token.interface';
import { ISession } from './session.interface';
import { IUserCredentialPasswordHistory } from './user-credential-password-history.interface';
import { IUserCredentialPassword } from './user-credential-password.interface';
import { IUserEmail } from './user-email.interface';
import { IUserPhone } from './user-phone.interface';
import { IUserRoles } from './user-roles.interface';

export interface IUser extends IBaseEntity {
    email: string;
    fullName: string;
    type: UserTypeEnum;

    userRoles?: IUserRoles[];
    emails?: IUserEmail[];
    phones?: IUserPhone[];
    credentialPassword?: IUserCredentialPassword;
    credentialPasswordHistory?: IUserCredentialPasswordHistory[];
    sessions?: ISession[];
    refreshTokens?: IRefreshToken[];
    groupMembers?: IGroupMember[];
    organizations?: IOrganization[];
}
