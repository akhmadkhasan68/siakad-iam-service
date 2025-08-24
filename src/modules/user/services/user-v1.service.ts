import { Injectable } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { IRole } from 'src/infrastructures/databases/interfaces/role.interface';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { ExportDataFactoryService } from 'src/infrastructures/modules/export-data/services/export-data-factory.service';
import { ImportDataFactoryService } from 'src/infrastructures/modules/import-data/services/import-data-factory.service';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource, In, QueryFailedError } from 'typeorm';
import { ZodError, ZodIssueCode } from 'zod';
import { RoleV1Repository } from '../../role/repositories/role-v1.repository';
import { UserCreateV1Request } from '../dtos/requests/user-create-v1.request';
import { UserPaginateV1Request } from '../dtos/requests/user-paginate-v1.request';
import { UserUpdatePasswordV1Request } from '../dtos/requests/user-update-password-v1.request';
import { UserUpdateV1Request } from '../dtos/requests/user-update-v1.request';
import { UserV1Repository } from '../repositories/user-v1.repository';

@Injectable()
export class UserV1Service {
    constructor(
        private readonly userV1Repository: UserV1Repository,
        private readonly roleV1Repository: RoleV1Repository,
        private readonly dataSource: DataSource,
        private readonly exportDataFactoryService: ExportDataFactoryService,
        private readonly importDataFactoryService: ImportDataFactoryService,
    ) {}

    /**
     * Creates a new user in the system
     *
     * @param dataCreate - The user creation data containing login credentials and profile information
     * @returns Promise resolving to the newly created user object
     *
     * @throws {Error} If user creation fails
     *
     * @remarks
     * The password is automatically hashed before storing in the database.
     * Role assignment is currently pending implementation.
     */
    async create(dataCreate: UserCreateV1Request): Promise<IUser> {
        const newUser = this.userV1Repository.create(dataCreate);

        const roles = await this.validateAndGetRoles(
            dataCreate.roleIds,
            'roleIds',
        );

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const userRepository = manager.getRepository(User);
            // newUser.userRoles = roles;

            await userRepository.save(newUser);
            await queryRunner.commitTransaction();

            return this.findOneById(newUser.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async validateAndGetRoles(
        ids: string[],
        path: string,
    ): Promise<IRole[]> {
        const roles = await this.roleV1Repository.findBy({
            id: In(ids),
        });

        const foundIds = roles.map((p) => p.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
            throw new ZodValidationException(
                new ZodError([
                    {
                        code: ZodIssueCode.custom,
                        message: `Role Id not found: ${Array.from(
                            notFoundIds,
                        ).join(' | ')}`,
                        path: [path],
                    },
                ]),
            );
        }

        return roles;
    }

    /**
     * Retrieves a paginated list of users based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching users
     * @returns A promise that resolves to paginated data containing user information
     *          with metadata about the pagination and an array of user items
     *
     * @example
     * const paginationDto = {
     *   page: 1,
     *   limit: 10
     * };
     * const result = await iamUserService.paginate(paginationDto);
     * // Returns: { meta: { ... }, items: [ ... ] }
     */
    async paginate(
        paginationDto: UserPaginateV1Request,
    ): Promise<IPaginateData<IUser>> {
        return this.userV1Repository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a user by their unique identifier
     * @param id - The unique identifier of the user to find
     * @returns Promise resolving to the user object
     * @throws EntityNotFoundError if user with given id does not exist
     */
    async findOneById(id: string): Promise<IUser> {
        return this.userV1Repository.findOneByIdOrFailWithRelations(id, [
            'roles',
            'roles.permissions',
        ]);
    }

    /**
     * Updates a user by their ID with the provided data
     * @param userId - The unique identifier of the user to update
     * @param dataUpdate - The data to update the user with
     * @returns Promise resolving to the updated user object
     * @throws {NotFoundException} If user with given ID is not found
     */
    async updateById(
        userId: string,
        dataUpdate: UserUpdateV1Request,
    ): Promise<IUser> {
        const user = await this.findOneById(userId);
        Object.assign(user, dataUpdate);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const userRepository = manager.getRepository(User);

            if (dataUpdate.roleIds && dataUpdate.roleIds.length > 0) {
                const roles = await this.validateAndGetRoles(
                    dataUpdate.roleIds,
                    'roleIds',
                );

                // user.roles = roles;
            }

            await userRepository.save(user);
            await queryRunner.commitTransaction();

            return this.findOneById(userId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Updates the password for a user by their ID
     * @param userId - The unique identifier of the user
     * @param dataUpdate - Object containing the new password information
     * @returns Promise resolving to the updated user object
     * @throws {NotFoundException} If the user is not found
     */
    async updatePasswordById(
        userId: string,
        dataUpdate: UserUpdatePasswordV1Request,
    ): Promise<IUser> {
        const user = await this.findOneById(userId);
        // user.password = dataUpdate.newPassword;
        await this.userV1Repository.save(user);

        return this.findOneById(userId);
    }

    /**
     * Performs a soft delete operation on a user record by ID.
     *
     * @param id - The unique identifier of the user to be soft deleted
     * @returns A promise that resolves to true if the deletion was successful
     * @throws QueryFailedError - If no records were affected by the delete operation
     */
    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.userV1Repository.softDelete({ id });
        if (status.affected && status.affected < 1) {
            throw new QueryFailedError(
                'Error, Data not deleted',
                undefined,
                new Error(),
            );
        }

        return true;
    }
}
