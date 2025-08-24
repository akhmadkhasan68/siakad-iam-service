import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/infrastructures/databases/entities/organization.entity';
import { IOrganization } from 'src/infrastructures/databases/interfaces/organization.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { OrganizationPaginateV1Request } from '../dtos/requests/organization-paginate-v1.request';


@Injectable()
export class OrganizationV1Repository extends Repository<IOrganization> {
    constructor(
        @InjectRepository(Organization)
        private readonly repo: Repository<IOrganization>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        request: OrganizationPaginateV1Request,
    ): Promise<IPaginateData<IOrganization>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['code', `${alias}.code`],
            ['name', `${alias}.name`],
            ['status', `${alias}.status`],
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
                    field: `${alias}.code`,
                    value: request.code,
                },
                {
                    field: `${alias}.status`,
                    value: request.status,
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
        query.take(request.perPage || 10);
        query.skip(PaginationUtil.countOffset(request));

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return { meta, items };
    }

    async findOneByIdOrFail(id: string): Promise<IOrganization> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }

    async findByCode(code: string): Promise<IOrganization | null> {
        return await this.findOne({
            where: {
                code,
            },
        });
    }
}