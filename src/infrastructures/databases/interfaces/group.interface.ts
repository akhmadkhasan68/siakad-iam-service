import { IBaseEntity } from './base-entity.interface';
import { IOrganization } from './organization.interface';
import { IGroupMember } from './group-member.interface';
import { IRole } from './role.interface';

export interface IGroup extends IBaseEntity {
    organizationId?: string;
    code: string;
    name: string;
    organization?: IOrganization;
    members?: IGroupMember[];
    roles?: IRole[];
}