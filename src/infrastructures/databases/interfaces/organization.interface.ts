import { IBaseEntity } from './base-entity.interface';
import { IRole } from './role.interface';
import { IUser } from './user.interface';
import { IGroup } from './group.interface';
import { IUserRoles } from './user-roles.interface';

export interface IOrganization extends IBaseEntity {
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    users?: IUser[];
    roles?: IRole[];
    groups?: IGroup[];
    userRoles?: IUserRoles[];
}