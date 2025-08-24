import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';
import { IRole } from './role.interface';
import { IOrganization } from './organization.interface';

export interface IUserRoles extends IBaseEntity {
    userId: string;
    roleId: string;
    organizationId?: string;
    user?: IUser;
    role?: IRole;
    organization?: IOrganization;
}