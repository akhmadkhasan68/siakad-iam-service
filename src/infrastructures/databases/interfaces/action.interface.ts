import { IBaseEntity } from './base-entity.interface';
import { IPermission } from './permission.interface';

export interface IAction extends IBaseEntity {
    code: string;
    name: string;
    isActive: boolean;
    permissions?: IPermission[];
}