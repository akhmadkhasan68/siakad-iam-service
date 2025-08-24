import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/infrastructures/databases/entities/group.entity';
import { IGroup } from 'src/infrastructures/databases/interfaces/group.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { GroupPaginateV1Request } from '../dtos/requests/group-paginate-v1.request';

@Injectable()
export class GroupV1Repository extends Repository<IGroup> {
    constructor(
        @InjectRepository(Group)
        private readonly repo: Repository<IGroup>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        request: GroupPaginateV1Request,
    ): Promise<IPaginateData<IGroup>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['code', `${alias}.code`],
            ['name', `${alias}.name`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name);

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.code`, type: 'string' },
                          { name: `${alias}.name`, type: 'string' },
                      ],
                  }
                : null,
            filters: [
                {
                    field: `${alias}.organizationId`,
                    value: request.organizationId,
                },
                {
                    field: `${alias}.code`,
                    value: request.code,
                },
            ],
        });

        // Handle sort
        QuerySortingUtil.applySorting(query, {
            sort: request.sort,
            order: request.order,
            allowedSorts: ALLOWED_SORTS,
        });

        // Handle pagination
        query.take(request.perPage);
        query.skip(PaginationUtil.countOffset(request));

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return { meta, items };
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IGroup | null> {
        return await this.findOne({
            where: { id },
            relations: relations || ['organization'],
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IGroup> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || ['organization'],
        });
    }
}
