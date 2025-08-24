import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Group } from 'src/infrastructures/databases/entities/group.entity';
import { IGroup } from 'src/infrastructures/databases/interfaces/group.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource, QueryFailedError } from 'typeorm';
import { GroupCreateV1Request } from '../dtos/requests/group-create-v1.request';
import { GroupPaginateV1Request } from '../dtos/requests/group-paginate-v1.request';
import { GroupUpdateV1Request } from '../dtos/requests/group-update-v1.request';
import { GroupV1Repository } from '../repositories/group-v1.repository';

@Injectable()
export class GroupV1Service {
    constructor(
        private readonly groupRepository: GroupV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves a paginated list of groups based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching groups
     * @returns A promise that resolves to paginated data containing group information
     *          with metadata about the pagination and an array of group items
     */
    async paginate(
        paginationDto: GroupPaginateV1Request,
    ): Promise<IPaginateData<IGroup>> {
        return this.groupRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a group by their unique identifier
     * @param id - The unique identifier of the group to find
     * @returns Promise resolving to the group object
     * @throws EntityNotFoundError if group with given id does not exist
     */
    async findOneById(id: string): Promise<IGroup> {
        return this.groupRepository.findOneByIdOrFailWithRelations(id, []);
    }

    /**
     * Finds and retrieves a group by their unique identifier with relations
     * @param id - The unique identifier of the group to find
     * @returns Promise resolving to the group object with relations
     * @throws EntityNotFoundError if group with given id does not exist
     */
    async findOneByIdWithRelations(id: string): Promise<IGroup> {
        return this.groupRepository.findOneByIdOrFailWithRelations(id);
    }

    /**
     * Creates a new group in the system
     *
     * @param dataCreate - The group creation data containing code, name and organization
     * @returns Promise resolving to the newly created group object
     *
     * @throws {ConflictException} If group with code already exists in organization
     * @throws {Error} If group creation fails
     */
    async create(dataCreate: GroupCreateV1Request): Promise<IGroup> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check for duplicate code within organization
            const existingGroup = await queryRunner.manager.findOne(Group, {
                where: {
                    code: dataCreate.code,
                    organizationId: dataCreate.organizationId || null,
                },
            });

            if (existingGroup) {
                throw new ConflictException(
                    'Group with this code already exists in the organization',
                );
            }

            const group = queryRunner.manager.create(Group, {
                organizationId: dataCreate.organizationId,
                code: dataCreate.code,
                name: dataCreate.name,
            });

            const savedGroup = await queryRunner.manager.save<Group>(group);
            await queryRunner.commitTransaction();

            return savedGroup;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Updates a group by their ID with the provided data
     * @param groupId - The unique identifier of the group to update
     * @param dataUpdate - The data to update the group with
     * @returns Promise resolving to the updated group object
     * @throws {NotFoundException} If group with given ID is not found
     * @throws {ConflictException} If code already exists for another group in the same organization
     */
    async updateById(
        groupId: string,
        dataUpdate: GroupUpdateV1Request,
    ): Promise<IGroup> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const group = await queryRunner.manager.findOne(Group, {
                where: { id: groupId },
            });

            if (!group) {
                throw new NotFoundException('Group not found');
            }

            // Check for duplicate code if code is being updated
            if (dataUpdate.code && dataUpdate.code !== group.code) {
                const existingGroup = await queryRunner.manager.findOne(Group, {
                    where: {
                        code: dataUpdate.code,
                        organizationId:
                            dataUpdate.organizationId || group.organizationId,
                    },
                });

                if (existingGroup && existingGroup.id !== groupId) {
                    throw new ConflictException(
                        'Group with this code already exists in the organization',
                    );
                }
            }

            Object.assign(group, dataUpdate);
            const savedGroup = await queryRunner.manager.save(group);
            await queryRunner.commitTransaction();

            return savedGroup;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Performs a soft delete operation on a group record by ID.
     *
     * @param id - The unique identifier of the group to be soft deleted
     * @returns A promise that resolves to true if the deletion was successful
     * @throws QueryFailedError - If no records were affected by the delete operation
     */
    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.groupRepository.softDelete({ id });
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
