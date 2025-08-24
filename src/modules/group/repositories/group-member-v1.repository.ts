import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMember } from 'src/infrastructures/databases/entities/group-member.entity';
import { IGroupMember } from 'src/infrastructures/databases/interfaces/group-member.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { GroupMemberPaginateV1Request } from '../dtos/requests/group-member-paginate-v1.request';

@Injectable()
export class GroupMemberV1Repository extends Repository<IGroupMember> {
    constructor(
        @InjectRepository(GroupMember)
        private readonly repo: Repository<IGroupMember>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async pagination(
        request: GroupMemberPaginateV1Request,
    ): Promise<IPaginateData<IGroupMember>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name);

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: null,
            filters: [
                {
                    field: `${alias}.groupId`,
                    value: request.groupId,
                },
                {
                    field: `${alias}.userId`,
                    value: request.userId,
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

    async findOneByIdOrFail(id: string): Promise<IGroupMember> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }

    async findOneByIdWithRelations(id: string): Promise<IGroupMember> {
        return await this.findOneOrFail({
            where: {
                id,
            },
            relations: ['group', 'user'],
        });
    }

    async findByGroupAndUser(groupId: string, userId: string): Promise<IGroupMember | null> {
        return await this.findOne({
            where: {
                groupId,
                userId,
            },
        });
    }
}