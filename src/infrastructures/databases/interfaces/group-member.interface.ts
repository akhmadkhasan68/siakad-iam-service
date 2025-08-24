import { IBaseEntity } from './base-entity.interface';
import { IGroup } from './group.interface';
import { IUser } from './user.interface';

export interface IGroupMember extends IBaseEntity {
    groupId: string;
    userId: string;
    group?: IGroup;
    user?: IUser;
}