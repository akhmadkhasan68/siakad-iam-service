import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IUserRoles } from '../interfaces/user-roles.interface';
import { IUser } from '../interfaces/user.interface';
import { IRole } from '../interfaces/role.interface';
import { IOrganization } from '../interfaces/organization.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Organization } from './organization.entity';

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true }) // composite unique index
export class UserRoles extends BaseEntity implements IUserRoles {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'uuid',
        name: 'role_id',
    })
    roleId: string;

    @Column({
        type: 'uuid',
        nullable: true,
        name: 'organization_id',
    })
    organizationId?: string;

    @ManyToOne(() => User, (user) => user.userRoles, {
        onDelete: 'CASCADE',
    })
    user?: IUser;

    @ManyToOne(() => Role, (role) => role.userRoles, {
        onDelete: 'CASCADE',
    })
    role?: IRole;

    @ManyToOne(() => Organization, (org) => org.userRoles, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    organization?: IOrganization;
}