import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Organization } from 'src/infrastructures/databases/entities/organization.entity';
import { IOrganization } from 'src/infrastructures/databases/interfaces/organization.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { OrganizationCreateV1Request } from '../dtos/requests/organization-create-v1.request';
import { OrganizationPaginateV1Request } from '../dtos/requests/organization-paginate-v1.request';
import { OrganizationUpdateV1Request } from '../dtos/requests/organization-update-v1.request';
import { OrganizationV1Repository } from '../repositories/organization-v1.repository';

@Injectable()
export class OrganizationV1Service {
    constructor(
        private readonly organizationRepository: OrganizationV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    async paginate(
        paginationDto: OrganizationPaginateV1Request,
    ): Promise<IPaginateData<IOrganization>> {
        return await this.organizationRepository.paginate(paginationDto);
    }

    async findOneById(id: string): Promise<IOrganization> {
        return await this.organizationRepository.findOneByIdOrFail(id);
    }

    async create(createDto: OrganizationCreateV1Request): Promise<IOrganization> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check for duplicate code
            const existingOrg = await this.organizationRepository.findByCode(
                createDto.code,
            );

            if (existingOrg) {
                throw new ConflictException(
                    'Organization with this code already exists',
                );
            }

            const organization = queryRunner.manager.create(Organization, {
                code: createDto.code,
                name: createDto.name,
                status: (createDto.status ||
                    'ACTIVE') as IOrganization['status'],
            });

            const savedOrganization =
                await queryRunner.manager.save(organization);
            await queryRunner.commitTransaction();

            return savedOrganization;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateById(
        id: string,
        updateDto: OrganizationUpdateV1Request,
    ): Promise<IOrganization> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const organization = await queryRunner.manager.findOne(
                Organization,
                {
                    where: { id },
                },
            );

            if (!organization) {
                throw new NotFoundException('Organization not found');
            }

            // Check for duplicate code if code is being updated
            if (updateDto.code && updateDto.code !== organization.code) {
                const existingOrg =
                    await this.organizationRepository.findByCode(
                        updateDto.code,
                    );

                if (existingOrg && existingOrg.id !== id) {
                    throw new ConflictException(
                        'Organization with this code already exists',
                    );
                }
            }

            Object.assign(organization, updateDto);
            const savedOrganization =
                await queryRunner.manager.save(organization);
            await queryRunner.commitTransaction();

            return savedOrganization;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async softDeleteById(id: string): Promise<boolean> {
        const result = await this.organizationRepository.softDelete({ id });
        if (result.affected && result.affected < 1) {
            throw new NotFoundException('Organization not found or not deleted');
        }
        return true;
    }
}
