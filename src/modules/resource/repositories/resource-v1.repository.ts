import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from 'src/infrastructures/databases/entities/resource.entity';
import { IResource } from 'src/infrastructures/databases/interfaces/resource.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';

@Injectable()
export class ResourceV1Repository extends Repository<IResource> {
    constructor(
        @InjectRepository(Resource)
        private readonly repo: Repository<IResource>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        request: ResourcePaginateV1Request,
    ): Promise<IPaginateData<IResource>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['code', `${alias}.code`],
            ['name', `${alias}.name`],
            ['is_active', `${alias}.isActive`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name);

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
                    field: `${alias}.code`,
                    value: request.code,
                },
                {
                    field: `${alias}.isActive`,
                    value: request.isActive,
                },
            ],
        });

        QuerySortingUtil.applySorting(query, {
            sort: request.sort,
            order: request.order,
            allowedSorts: ALLOWED_SORTS,
        });

        query.take(request.perPage);
        query.skip(PaginationUtil.countOffset(request));

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return { meta, items };
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IResource | null> {
        return await this.findOne({
            where: { id },
            relations: relations || [],
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IResource> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || [],
        });
    }

    async findOneByCode(code: string): Promise<IResource | null> {
        return await this.findOne({ where: { code } });
    }
}
