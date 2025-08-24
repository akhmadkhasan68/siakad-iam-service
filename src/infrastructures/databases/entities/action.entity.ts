import { Column, Entity } from 'typeorm';
import { IAction } from '../interfaces/action.interface';
import { IPermission } from '../interfaces/permission.interface';
import { BaseEntity } from './base.entity';

@Entity('actions')
export class Action extends BaseEntity implements IAction {
    @Column({
        type: 'varchar',
        length: 50,
    })
    code: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string;

    @Column({
        type: 'boolean',
        default: false,
        name: 'is_active',
    })
    isActive: boolean;

    // Relations will be added after permission entity is created
    permissions?: IPermission[];
}