import { IBaseEntity } from './base-entity.interface';
import { IGroup } from './group.interface';
import { IOrganization } from './organization.interface';
import { IPermission } from './permission.interface';
import { IUserRoles } from './user-roles.interface';

export interface IRole extends IBaseEntity {
    organizationId?: string | null;
    code: string;
    name: string;
    description?: string;
    organization?: IOrganization;
    permissions?: IPermission[];
    groups?: IGroup[];
    userRoles?: IUserRoles[];
}
