import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { IGroup } from '../interfaces/group.interface';
import { IOrganization } from '../interfaces/organization.interface';
import { IGroupMember } from '../interfaces/group-member.interface';
import { IRole } from '../interfaces/role.interface';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { GroupMember } from './group-member.entity';

@Entity('groups')
@Index(['organizationId', 'code'], { unique: true }) // composite unique index
export class Group extends BaseEntity implements IGroup {
    @Column({
        type: 'uuid',
        nullable: true,
        name: 'organization_id',
    })
    organizationId?: string;

    @Column({
        type: 'text',
    })
    code: string;

    @Column({
        type: 'text',
    })
    name: string;

    @ManyToOne(() => Organization, (org) => org.groups, {
        nullable: true,
    })
    organization?: IOrganization;

    @OneToMany(() => GroupMember, (member) => member.group)
    members?: IGroupMember[];

    // Many-to-many relation with roles will be added after role entity update
    roles?: IRole[];
}