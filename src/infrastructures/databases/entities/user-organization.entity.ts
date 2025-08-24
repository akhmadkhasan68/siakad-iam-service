import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IUserOrganization } from '../interfaces/user-organization.interface';
import { IUser } from '../interfaces/user.interface';
import { IOrganization } from '../interfaces/organization.interface';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('user_organizations')
@Index(['userId', 'organizationId'], { unique: true }) // composite unique index
export class UserOrganization extends BaseEntity implements IUserOrganization {
    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @Column({
        type: 'uuid',
        name: 'organization_id',
    })
    organizationId: string;

    @Column({
        type: 'boolean',
        default: false,
        name: 'is_default',
    })
    isDefault: boolean;

    @ManyToOne(() => User, (user) => user.organizations, {
        onDelete: 'CASCADE',
    })
    user?: IUser;

    @ManyToOne(() => Organization, (org) => org.users, {
        onDelete: 'CASCADE',
    })
    organization?: IOrganization;
}