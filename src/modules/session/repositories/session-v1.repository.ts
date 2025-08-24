import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/infrastructures/databases/entities/session.entity';
import { ISession } from 'src/infrastructures/databases/interfaces/session.interface';
import { PaginateOrderEnum } from 'src/shared/enums/paginate-order.enum';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { IsNull, Repository } from 'typeorm';
import { SessionPaginateV1Request } from '../dtos/requests/session-paginate-v1.request';

@Injectable()
export class SessionV1Repository extends Repository<ISession> {
    constructor(
        @InjectRepository(Session)
        private readonly repo: Repository<ISession>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        request: SessionPaginateV1Request,
    ): Promise<IPaginateData<ISession>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['last_seen_at', `${alias}.lastSeenAt`],
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
                    field: `${alias}.userId`,
                    value: request.userId,
                },
                {
                    field: `${alias}.revokedAt`,
                    value: request.isRevoked ? 'NOT_NULL' : 'NULL',
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

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<ISession | null> {
        return await this.findOne({
            where: { id },
            relations: relations || [],
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<ISession> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || [],
        });
    }

    async findActiveSessionsByUser(userId: string): Promise<ISession[]> {
        return await this.find({
            where: {
                userId,
                revokedAt: IsNull(),
            },
            order: {
                lastSeenAt: PaginateOrderEnum.DESC,
            },
        });
    }

    async revokeUserSessions(userId: string): Promise<void> {
        await this.update(
            {
                userId,
                revokedAt: IsNull(),
            },
            {
                revokedAt: new Date(),
            },
        );
    }
}
