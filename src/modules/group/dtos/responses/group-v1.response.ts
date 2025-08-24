import { IGroup } from 'src/infrastructures/databases/interfaces/group.interface';
import { OrganizationV1Response } from 'src/modules/organization/dtos/responses/organization-v1.response';

export class GroupV1Response {
    id: string;
    code: string;
    name: string;
    organizationId?: string;

    static FromEntity(data: IGroup): GroupV1Response {
        return {
            id: data.id,
            code: data.code,
            name: data.name,
            organizationId: data.organizationId,
        };
    }

    static MapEntities(data: IGroup[]): GroupV1Response[] {
        return data.map((group) => this.FromEntity(group));
    }
}

export class GroupDetailV1Response extends GroupV1Response {
    organization?: OrganizationV1Response | null;

    static FromEntity(data: IGroup): GroupDetailV1Response {
        const response = new GroupDetailV1Response();
        response.id = data.id;
        response.code = data.code;
        response.name = data.name;
        response.organizationId = data.organizationId;
        response.organization = data.organization
            ? OrganizationV1Response.FromEntity(data.organization)
            : null;

        return response;
    }

    static MapEntities(data: IGroup[]): GroupDetailV1Response[] {
        return data.map((group) => this.FromEntity(group));
    }
}