import { IPermission } from 'src/infrastructures/databases/interfaces/permission.interface';
import { ActionV1Response } from 'src/modules/action/dtos/responses/action-v1.response';
import { ResourceV1Response } from 'src/modules/resource/dtos/responses/resource-v1.response';
import { PermissionUtil } from 'src/shared/utils/permission.util';

export class PermissionV1Response {
    id: string;
    code: string;
    description: string | null;

    static FromEntity(data: IPermission): PermissionV1Response {
        const response = new PermissionV1Response();
        response.id = data.id;
        response.code = PermissionUtil.getPermissionCodes(data);
        response.description = data.description || null;

        return response;
    }

    static MapEntities(data: IPermission[]): PermissionV1Response[] {
        return data.map((permission) => this.FromEntity(permission));
    }
}

export class PermissionDetailV1Response extends PermissionV1Response {
    resource: ResourceV1Response | null;
    action: ActionV1Response | null;

    static FromEntity(data: IPermission): PermissionDetailV1Response {
        const response = new PermissionDetailV1Response();
        response.id = data.id;
        response.code = PermissionUtil.getPermissionCodes(data);
        response.description = data.description || null;
        response.resource = data.resource
            ? ResourceV1Response.FromEntity(data.resource)
            : null;
        response.action = data.action
            ? ActionV1Response.FromEntity(data.action)
            : null;

        return response;
    }

    static MapEntities(data: IPermission[]): PermissionDetailV1Response[] {
        return data.map((permission) => this.FromEntity(permission));
    }
}
