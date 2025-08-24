import { IRole } from 'src/infrastructures/databases/interfaces/role.interface';
import { PermissionV1Response } from '../../../permission/dtos/responses/permission-v1.response';

export class RoleV1Response {
    id: string;
    name: string;
    code: string;

    static FromEntity(data: IRole): RoleV1Response {
        return {
            id: data.id,
            name: data.name,
            code: data.code,
        };
    }

    static MapEntities(data: IRole[]): RoleV1Response[] {
        return data.map((role) => this.FromEntity(role));
    }
}

export class RoleDetailV1Response extends RoleV1Response {
    permissions?: PermissionV1Response[];

    static FromEntity(data: IRole): RoleDetailV1Response {
        return {
            id: data.id,
            name: data.name,
            code: data.code,
            permissions: data.permissions?.map((permission) =>
                PermissionV1Response.FromEntity(permission),
            ),
        };
    }

    static MapEntities(data: IRole[]): RoleDetailV1Response[] {
        return data.map((role) => this.FromEntity(role));
    }
}
