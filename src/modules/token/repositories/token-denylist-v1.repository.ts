import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenDenylist } from 'src/infrastructures/databases/entities/token-denylist.entity';
import { ITokenDenylist } from 'src/infrastructures/databases/interfaces/token-denylist.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { TokenDenylistPaginateV1Request } from '../dtos/requests/token-denylist-paginate-v1.request';

@Injectable()
export class TokenDenylistV1Repository extends Repository<ITokenDenylist> {
    constructor(
        @InjectRepository(TokenDenylist)
        private readonly repo: Repository<ITokenDenylist>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = [];

    async paginate(
        request: TokenDenylistPaginateV1Request,
    ): Promise<IPaginateData<ITokenDenylist>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['jti', `${alias}.jti`],
            ['reason', `${alias}.reason`],
            ['expires_at', `${alias}.expiresAt`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(
            this.metadata.name,
        );

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.jti`, type: 'string' },
                          { name: `${alias}.reason`, type: 'string' },
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

    async findOneByIdOrFail(id: string): Promise<ITokenDenylist> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<ITokenDenylist | null> {
        return await this.findOne({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<ITokenDenylist> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findByJti(jti: string): Promise<ITokenDenylist | null> {
        return await this.findOne({
            where: {
                jti,
            },
        });
    }

    async isTokenBlacklisted(jti: string): Promise<boolean> {
        const denylistEntry = await this.findOne({
            where: {
                jti,
                expiresAt: { $gt: new Date() } as any,
            },
        });

        return !!denylistEntry;
    }

    async cleanupExpiredTokens(): Promise<void> {
        await this.createQueryBuilder()
            .delete()
            .where('expiresAt <= :now', { now: new Date() })
            .execute();
    }
}
