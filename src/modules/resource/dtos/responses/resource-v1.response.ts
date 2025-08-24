import { IResource } from 'src/infrastructures/databases/interfaces/resource.interface';

export class ResourceV1Response {
    id: string;
    code: string;
    name: string;
    isActive: boolean;

    static FromEntity(data: IResource): ResourceV1Response {
        return {
            id: data.id,
            name: data.name,
            code: data.code,
            isActive: data.isActive,
        };
    }

    static MapEntities(data: IResource[]): ResourceV1Response[] {
        return data.map((resource) => this.FromEntity(resource));
    }
}
