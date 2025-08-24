import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtKey } from 'src/infrastructures/databases/entities/jwt-key.entity';
import { IJwtKey } from 'src/infrastructures/databases/interfaces/jwt-key.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { JwtKeyPaginateV1Request } from '../dtos/requests/jwt-key-paginate-v1.request';

@Injectable()
export class JwtKeyV1Repository extends Repository<IJwtKey> {
    constructor(
        @InjectRepository(JwtKey)
        private readonly repo: Repository<IJwtKey>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = [];

    async paginate(
        request: JwtKeyPaginateV1Request,
    ): Promise<IPaginateData<IJwtKey>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['kid', `${alias}.kid`],
            ['alg', `${alias}.alg`],
            ['note', `${alias}.note`],
            ['is_active', `${alias}.isActive`],
            ['expires_at', `${alias}.expiresAt`],
            ['rotated_at', `${alias}.rotatedAt`],
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
                          { name: `${alias}.kid`, type: 'string' },
                          { name: `${alias}.alg`, type: 'string' },
                          { name: `${alias}.note`, type: 'string' },
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

    async findOneByIdOrFail(id: string): Promise<IJwtKey> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IJwtKey | null> {
        return await this.findOne({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IJwtKey> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findActiveByKid(kid: string): Promise<IJwtKey | null> {
        return await this.findOne({
            where: {
                kid,
                isActive: true,
            },
        });
    }

    async findAllActive(): Promise<IJwtKey[]> {
        return await this.find({
            where: {
                isActive: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
}