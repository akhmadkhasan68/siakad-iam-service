import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { UserPaginateV1Request } from '../dtos/requests/user-paginate-v1.request';

/**
 * UserV1Repository class is a TypeORM repository for managing user entities.
 * It extends the base Repository class from TypeORM.
 */
@Injectable()
export class UserV1Repository extends Repository<IUser> {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<IUser>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = [
        'roles',
        'roles.permissions',
        'roles.permissions.operation',
        'roles.permissions.resource',
    ];

    async paginate(
        request: UserPaginateV1Request,
    ): Promise<IPaginateData<IUser>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['fullname', `${alias}.fullname`],
            ['email', `${alias}.email`],
            ['phone_number', `${alias}.phoneNumber`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(
            this.metadata.name,
        ).leftJoinAndSelect(`${alias}.roles`, 'roles');

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.fullname`, type: 'string' },
                          { name: `${alias}.email`, type: 'string' },
                          { name: `${alias}.phoneNumber`, type: 'string' },
                      ],
                  }
                : null,
            filters: [
                {
                    field: `${alias}.emailVerifiedAt`,
                    value: request.emailVerfied,
                },
                {
                    field: `${alias}.phoneNumberVerifiedAt`,
                    value: request.phoneNumberVerified,
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

        return {
            meta,
            items,
        };
    }

    /**
     * Finds a user by their ID with optional relations.
     * @param id The ID of the user to find.
     * @param relations Optional array of relations to include in the query.
     * @returns A promise that resolves to the found user or null if not found.
     */
    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IUser | null> {
        return await this.findOne({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IUser> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    /**
     * Finds a user by their email address.
     * @param email The email address of the user to find.
     * @returns A promise that resolves to the found user or undefined if not found.
     */
    async findOneByEmail(email: string): Promise<IUser | null> {
        return await this.findOne({ where: { email } });
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        await this.update(userId, {
            credentialPassword: { password: newPassword },
        });
    }
}
