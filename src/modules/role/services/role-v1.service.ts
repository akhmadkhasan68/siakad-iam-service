import { Injectable } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { config } from 'src/config';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { IPermission } from 'src/infrastructures/databases/interfaces/permission.interface';
import { IRole } from 'src/infrastructures/databases/interfaces/role.interface';
import { ExportDataFactoryService } from 'src/infrastructures/modules/export-data/services/export-data-factory.service';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { StringUtil } from 'src/shared/utils/string.util';
import {
    DataSource,
    EntityManager,
    In,
    IsNull,
    Not,
    QueryFailedError,
} from 'typeorm';
import { ZodError, ZodIssueCode } from 'zod';
import { PermissionV1Repository } from '../../permission/repositories/permission-v1.repository';
import { RoleCreateV1Request } from '../dtos/requests/role-create-v1.request';
import { RolePaginateV1Request } from '../dtos/requests/role-paginate-v1.request';
import { RolePermissionPaginateV1Request } from '../dtos/requests/role-permission-paginate-v1.request';
import { RoleUpdateV1Request } from '../dtos/requests/role-update-v1.request';
import { RoleV1Repository } from '../repositories/role-v1.repository';

@Injectable()
export class RoleV1Service {
    constructor(
        private readonly roleV1Repository: RoleV1Repository,
        private readonly permissionV1Repository: PermissionV1Repository,
        private readonly dataSource: DataSource,
        private readonly exportDataFactoryService: ExportDataFactoryService,
    ) {}

    async paginate(
        paginationDto: RolePaginateV1Request,
    ): Promise<IPaginateData<IRole>> {
        return await this.roleV1Repository.pagination(paginationDto);
    }

    async paginatePermission(
        id: string,
        paginationDto: RolePermissionPaginateV1Request,
    ): Promise<IPaginateData<IPermission>> {
        const role = await this.roleV1Repository.findOneByIdOrFail(id);

        return this.permissionV1Repository.paginationByRoleId(
            role.id,
            paginationDto,
        );
    }

    async findOneById(id: string): Promise<IRole> {
        return await this.roleV1Repository.findOneByIdOrFailWithRelations(id, [
            'permissions',
        ]);
    }

    async create(dataCreate: RoleCreateV1Request): Promise<IRole> {
        const newRole = this.roleV1Repository.create({
            ...dataCreate,
            code: StringUtil.convertToSlugCase(dataCreate.name),
        });

        const permissions = await this.validateAndGetPermissions(
            dataCreate.permissionIds,
            'permissionIds',
        );

        newRole.permissions = permissions;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const roleRepository = manager.getRepository(Role);

            // To avoid duplicate key from deleted data
            await this.updateExistingCode(newRole.code, manager);

            await roleRepository.save(newRole);

            await queryRunner.commitTransaction();
            return newRole;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateById(
        roleId: string,
        dataUpdate: RoleUpdateV1Request,
    ): Promise<IRole> {
        const role = await this.findOneById(roleId);
        Object.assign(role, dataUpdate);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const roleRepository = manager.getRepository(Role);

            if (
                dataUpdate.permissionIds &&
                dataUpdate.permissionIds.length > 0
            ) {
                const permissions = await this.validateAndGetPermissions(
                    dataUpdate.permissionIds,
                    'permissionIds',
                );

                role.permissions = permissions;
            }

            await roleRepository.save(role);

            await queryRunner.commitTransaction();
            return this.findOneById(roleId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.roleV1Repository.softDelete({ id });
        if (status.affected && status.affected < 1) {
            throw new QueryFailedError(
                'Error, Data not deleted',
                undefined,
                new Error(),
            );
        }

        return true;
    }

    private async validateAndGetPermissions(
        ids: string[],
        path: string,
    ): Promise<IPermission[]> {
        const permissions = await this.permissionV1Repository.findBy({
            id: In(ids),
        });

        const foundIds = permissions.map((p) => p.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
            throw new ZodValidationException(
                new ZodError([
                    {
                        code: ZodIssueCode.custom,
                        message: `Permission Id not found: ${Array.from(
                            notFoundIds,
                        ).join(' | ')}`,
                        path: [path],
                    },
                ]),
            );
        }

        return permissions;
    }

    private async updateExistingCode(
        code: string,
        manager: EntityManager | null = null,
    ): Promise<void> {
        const roleRepository =
            manager?.getRepository(Role) || this.roleV1Repository;
        const existingRoleKey = await roleRepository.findOne({
            where: {
                code,
                deletedAt: Not(IsNull()),
            },
            withDeleted: true,
        });
        if (existingRoleKey) {
            await roleRepository.update(
                { id: existingRoleKey.id },
                {
                    ...existingRoleKey,
                    code: `${existingRoleKey.code}-${config.db.deletedRecordPrefix}`,
                },
            );
        }
    }
}
