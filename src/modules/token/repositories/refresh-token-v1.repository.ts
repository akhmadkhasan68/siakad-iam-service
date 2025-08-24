import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/infrastructures/databases/entities/refresh-token.entity';
import { IRefreshToken } from 'src/infrastructures/databases/interfaces/refresh-token.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { IsNull, Repository } from 'typeorm';
import { RefreshTokenPaginateV1Request } from '../dtos/requests/refresh-token-paginate-v1.request';

@Injectable()
export class RefreshTokenV1Repository extends Repository<IRefreshToken> {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly repo: Repository<IRefreshToken>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = ['user', 'session'];

    async paginate(
        request: RefreshTokenPaginateV1Request,
    ): Promise<IPaginateData<IRefreshToken>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['user_id', `${alias}.userId`],
            ['session_id', `${alias}.sessionId`],
            ['ip', `${alias}.ip`],
            ['user_agent', `${alias}.userAgent`],
            ['issued_at', `${alias}.issuedAt`],
            ['expires_at', `${alias}.expiresAt`],
            ['revoked_at', `${alias}.revokedAt`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(
            this.metadata.name,
        ).leftJoinAndSelect(`${alias}.user`, 'user')
         .leftJoinAndSelect(`${alias}.session`, 'session');

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.ip`, type: 'string' },
                          { name: `${alias}.userAgent`, type: 'string' },
                          { name: 'user.fullname', type: 'string' },
                          { name: 'user.email', type: 'string' },
                      ],
                  }
                : null,
            filters: [],
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

        return {
            meta,
            items,
        };
    }

    async findOneByIdOrFail(id: string): Promise<IRefreshToken> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IRefreshToken | null> {
        return await this.findOne({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IRefreshToken> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findByToken(token: string): Promise<IRefreshToken | null> {
        return await this.findOne({
            where: {
                token,
                revokedAt: IsNull(),
            },
        });
    }

    async findByUserAndSession(
        userId: string,
        sessionId: string,
    ): Promise<IRefreshToken | null> {
        return await this.findOne({
            where: {
                userId,
                sessionId,
                revokedAt: IsNull(),
            },
        });
    }

    async revokeExpiredTokens(): Promise<void> {
        await this.update(
            {
                revokedAt: IsNull(),
                expiresAt: { $lt: new Date() } as any,
            },
            {
                revokedAt: new Date(),
            },
        );
    }
}
