import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
} from 'typeorm';
import { IAction } from '../interfaces/action.interface';
import { IPermission } from '../interfaces/permission.interface';
import { IResource } from '../interfaces/resource.interface';
import { IRole } from '../interfaces/role.interface';
import { Action } from './action.entity';
import { BaseEntity } from './base.entity';
import { Resource } from './resource.entity';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['resourceId', 'actionId'], { unique: true }) // composite unique index
export class Permission extends BaseEntity implements IPermission {
    @Column({
        type: 'uuid',
        nullable: false,
        name: 'resource_id',
    })
    resourceId: string;

    @Column({
        type: 'uuid',
        nullable: false,
        name: 'action_id',
    })
    actionId: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;

    @ManyToOne(() => Resource, (resource) => resource.permissions, {
        nullable: true,
    })
    resource?: IResource;

    @ManyToOne(() => Action, (action) => action.permissions, {
        nullable: true,
    })
    action?: IAction;

    @ManyToMany(() => Role)
    @JoinTable({ name: 'role_permissions' })
    roles?: IRole[];
}
