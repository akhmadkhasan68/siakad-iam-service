import { ConflictException, Injectable } from '@nestjs/common';
import { Resource } from 'src/infrastructures/databases/entities/resource.entity';
import { IResource } from 'src/infrastructures/databases/interfaces/resource.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource, QueryFailedError } from 'typeorm';
import { ResourceCreateV1Request } from '../dtos/requests/resource-create-v1.request';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';
import { ResourceUpdateV1Request } from '../dtos/requests/resource-update-v1.request';
import { ResourceV1Repository } from '../repositories/resource-v1.repository';

@Injectable()
export class ResourceV1Service {
    constructor(
        private readonly resourceRepository: ResourceV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Creates a new resource in the system
     *
     * @param dataCreate - The resource creation data containing code and name
     * @returns Promise resolving to the newly created resource object
     *
     * @throws {ConflictException} If resource with code already exists
     * @throws {Error} If resource creation fails
     */
    async create(dataCreate: ResourceCreateV1Request): Promise<IResource> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingResource = await this.resourceRepository.findOneByCode(
                dataCreate.code,
            );

            if (existingResource) {
                throw new ConflictException(
                    'Resource with this code already exists',
                );
            }

            const newResource = this.resourceRepository.create(dataCreate);
            const manager = queryRunner.manager;
            const resourceRepository = manager.getRepository(Resource);

            await resourceRepository.save(newResource);
            await queryRunner.commitTransaction();

            return this.findOneById(newResource.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Retrieves a paginated list of resources based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching resources
     * @returns A promise that resolves to paginated data containing resource information
     *          with metadata about the pagination and an array of resource items
     */
    async paginate(
        paginationDto: ResourcePaginateV1Request,
    ): Promise<IPaginateData<IResource>> {
        return await this.resourceRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a resource by their unique identifier
     * @param id - The unique identifier of the resource to find
     * @returns Promise resolving to the resource object
     * @throws EntityNotFoundError if resource with given id does not exist
     */
    async findOneById(id: string): Promise<IResource> {
        return this.resourceRepository.findOneByIdOrFailWithRelations(id, []);
    }

    /**
     * Updates a resource by their ID with the provided data
     * @param resourceId - The unique identifier of the resource to update
     * @param dataUpdate - The data to update the resource with
     * @returns Promise resolving to the updated resource object
     * @throws {NotFoundException} If resource with given ID is not found
     * @throws {ConflictException} If code already exists for another resource
     */
    async updateById(
        resourceId: string,
        dataUpdate: ResourceUpdateV1Request,
    ): Promise<IResource> {
        const resource = await this.findOneById(resourceId);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (dataUpdate.code && dataUpdate.code !== resource.code) {
                const existingResource = await this.resourceRepository.findOneByCode(
                    dataUpdate.code,
                );

                if (existingResource && existingResource.id !== resourceId) {
                    throw new ConflictException(
                        'Resource with this code already exists',
                    );
                }
            }

            Object.assign(resource, dataUpdate);
            const manager = queryRunner.manager;
            const resourceRepository = manager.getRepository(Resource);

            await resourceRepository.save(resource);
            await queryRunner.commitTransaction();

            return this.findOneById(resourceId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Performs a soft delete operation on a resource record by ID.
     *
     * @param id - The unique identifier of the resource to be soft deleted
     * @returns A promise that resolves to true if the deletion was successful
     * @throws QueryFailedError - If no records were affected by the delete operation
     */
    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.resourceRepository.softDelete({ id });
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
