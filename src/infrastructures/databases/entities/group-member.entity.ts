import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IGroupMember } from '../interfaces/group-member.interface';
import { IGroup } from '../interfaces/group.interface';
import { IUser } from '../interfaces/user.interface';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_members')
@Index(['groupId', 'userId'], { unique: true }) // composite unique index
export class GroupMember extends BaseEntity implements IGroupMember {
    @Column({
        type: 'uuid',
        name: 'group_id',
    })
    groupId: string;

    @Column({
        type: 'uuid',
        name: 'user_id',
    })
    userId: string;

    @ManyToOne(() => Group, (group) => group.members, {
        onDelete: 'CASCADE',
    })
    group?: IGroup;

    @ManyToOne(() => User, (user) => user.groupMembers, {
        onDelete: 'CASCADE',
    })
    user?: IUser;
}