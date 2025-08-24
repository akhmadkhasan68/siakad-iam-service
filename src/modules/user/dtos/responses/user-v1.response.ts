import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { RoleDetailV1Response } from '../../../role/dtos/responses/role-v1.response';

export class UserV1Response {
    id: string;
    fullName: string;
    email: string;

    static FromEntity(entity: IUser): UserV1Response {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
        };
    }

    static MapEntities(entities: IUser[]): UserV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}

export class UserDetailV1Response extends UserV1Response {
    roles?: RoleDetailV1Response[];

    static FromEntity(entity: IUser): UserDetailV1Response {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            // roles: entity.userRoles
            //     ? RoleDetailV1Response.MapEntities(entity.roles)
            //     : [],
        };
    }

    static MapEntities(entities: IUser[]): UserDetailV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
