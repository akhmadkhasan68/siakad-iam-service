import { IGroupMember } from 'src/infrastructures/databases/interfaces/group-member.interface';
import { GroupV1Response } from './group-v1.response';
import { UserV1Response } from 'src/modules/user/dtos/responses/user-v1.response';

export class GroupMemberV1Response {
    id: string;
    groupId: string;
    userId: string;

    static FromEntity(data: IGroupMember): GroupMemberV1Response {
        return {
            id: data.id,
            groupId: data.groupId,
            userId: data.userId,
        };
    }

    static MapEntities(data: IGroupMember[]): GroupMemberV1Response[] {
        return data.map((member) => this.FromEntity(member));
    }
}

export class GroupMemberDetailV1Response extends GroupMemberV1Response {
    group?: GroupV1Response | null;
    user?: UserV1Response | null;

    static FromEntity(data: IGroupMember): GroupMemberDetailV1Response {
        const response = new GroupMemberDetailV1Response();
        response.id = data.id;
        response.groupId = data.groupId;
        response.userId = data.userId;
        response.group = data.group
            ? GroupV1Response.FromEntity(data.group)
            : null;
        response.user = data.user
            ? UserV1Response.FromEntity(data.user)
            : null;

        return response;
    }

    static MapEntities(data: IGroupMember[]): GroupMemberDetailV1Response[] {
        return data.map((member) => this.FromEntity(member));
    }
}