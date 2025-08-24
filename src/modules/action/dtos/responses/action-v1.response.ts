import { IAction } from 'src/infrastructures/databases/interfaces/action.interface';

export class ActionV1Response {
    id: string;
    code: string;
    name: string;
    isActive: boolean;

    static FromEntity(data: IAction): ActionV1Response {
        return {
            id: data.id,
            code: data.code,
            name: data.name,
            isActive: data.isActive,
        };
    }

    static MapEntities(data: IAction[]): ActionV1Response[] {
        return data.map((action) => this.FromEntity(action));
    }
}
