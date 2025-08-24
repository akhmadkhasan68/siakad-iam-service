import { Column, Entity } from 'typeorm';
import { IResource } from '../interfaces/resource.interface';
import { IPermission } from '../interfaces/permission.interface';
import { BaseEntity } from './base.entity';

@Entity('resources')
export class Resource extends BaseEntity implements IResource {
    @Column({
        type: 'varchar',
        length: 100,
    })
    code: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        type: 'boolean',
        default: false,
        name: 'is_active',
    })
    isActive: boolean;

    // Relations will be added after permission entity is updated
    permissions?: IPermission[];
}
