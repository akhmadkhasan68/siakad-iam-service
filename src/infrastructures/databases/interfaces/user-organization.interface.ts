import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';
import { IOrganization } from './organization.interface';

export interface IUserOrganization extends IBaseEntity {
    userId: string;
    organizationId: string;
    isDefault: boolean;
    user?: IUser;
    organization?: IOrganization;
}