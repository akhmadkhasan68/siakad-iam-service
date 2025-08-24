import { IAction } from './action.interface';
import { IBaseEntity } from './base-entity.interface';
import { IResource } from './resource.interface';
import { IRole } from './role.interface';

export interface IPermission extends IBaseEntity {
    resourceId: string;
    actionId: string;
    description?: string;
    resource?: IResource;
    action?: IAction;
    roles?: IRole[];
}
