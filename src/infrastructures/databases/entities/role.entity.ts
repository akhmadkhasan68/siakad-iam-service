import {
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { IGroup } from '../interfaces/group.interface';
import { IOrganization } from '../interfaces/organization.interface';
import { IPermission } from '../interfaces/permission.interface';
import { IRole } from '../interfaces/role.interface';
import { IUserRoles } from '../interfaces/user-roles.interface';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { Permission } from './permission.entity';
import { UserRoles } from './user-roles.entity';

@Entity('roles')
@Index(['organizationId', 'code'], { unique: true }) // composite unique index
export class Role extends BaseEntity implements IRole {
    @Column({
        type: 'uuid',
        nullable: true,
        name: 'organization_id',
    })
    organizationId?: string | null;

    @Column({
        type: 'text',
    })
    code: string;

    @Column({
        type: 'text',
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;

    @ManyToOne(() => Organization, (org) => org.roles, {
        nullable: true,
    })
    organization?: IOrganization;

    @ManyToMany(() => Permission)
    @JoinTable({ name: 'role_permissions' })
    permissions?: IPermission[];

    // Many-to-many relation with groups will be handled by group_roles table
    groups?: IGroup[];

    @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
    userRoles?: IUserRoles[];
}
