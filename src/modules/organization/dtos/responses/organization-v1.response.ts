import { IOrganization } from 'src/infrastructures/databases/interfaces/organization.interface';

export class OrganizationV1Response {
    id: string;
    code: string;
    name: string;
    status: string;

    static FromEntity(data: IOrganization): OrganizationV1Response {
        return {
            id: data.id,
            code: data.code,
            name: data.name,
            status: data.status,
        };
    }

    static MapEntities(data: IOrganization[]): OrganizationV1Response[] {
        return data.map((organization) => this.FromEntity(organization));
    }
}