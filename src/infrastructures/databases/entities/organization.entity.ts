import { Column, Entity, OneToMany } from 'typeorm';
import { IOrganization } from '../interfaces/organization.interface';
import { IRole } from '../interfaces/role.interface';
import { IUser } from '../interfaces/user.interface';
import { IGroup } from '../interfaces/group.interface';
import { IUserRoles } from '../interfaces/user-roles.interface';
import { BaseEntity } from './base.entity';
import { UserRoles } from './user-roles.entity';

@Entity('organizations')
export class Organization extends BaseEntity implements IOrganization {
    @Column({
        type: 'text',
        unique: true,
    })
    code: string;

    @Column({
        type: 'text',
    })
    name: string;

    @Column({
        type: 'text',
        default: 'ACTIVE',
    })
    status: 'ACTIVE' | 'INACTIVE';

    // Relations will be added after creating the related entities
    users?: IUser[];
    roles?: IRole[];
    groups?: IGroup[];

    @OneToMany(() => UserRoles, (userRoles) => userRoles.organization)
    userRoles?: IUserRoles[];
}