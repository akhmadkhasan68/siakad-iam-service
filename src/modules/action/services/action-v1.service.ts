import { Injectable } from '@nestjs/common';
import { IAction } from 'src/infrastructures/databases/interfaces/action.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { ActionPaginateV1Request } from '../dtos/requests/action-paginate-v1.request';
import { ActionV1Repository } from '../repositories/action-v1.repository';

@Injectable()
export class ActionV1Service {
    constructor(private readonly actionRepository: ActionV1Repository) {}

    async paginate(
        paginationDto: ActionPaginateV1Request,
    ): Promise<IPaginateData<IAction>> {
        return await this.actionRepository.pagination(paginationDto);
    }

    async findOneById(id: string): Promise<IAction> {
        return await this.actionRepository.findOneByIdOrFail(id);
    }
}
