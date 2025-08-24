import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtKey } from 'src/infrastructures/databases/entities/jwt-key.entity';
import { IJwtKey } from 'src/infrastructures/databases/interfaces/jwt-key.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { JwtKeyCreateV1Request } from '../dtos/requests/jwt-key-create-v1.request';
import { JwtKeyPaginateV1Request } from '../dtos/requests/jwt-key-paginate-v1.request';
import { JwtKeyUpdateV1Request } from '../dtos/requests/jwt-key-update-v1.request';
import { JwtKeyV1Repository } from '../repositories/jwt-key-v1.repository';

@Injectable()
export class JwtKeyV1Service {
    constructor(
        private readonly jwtKeyRepository: JwtKeyV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves a paginated list of JWT keys based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching JWT keys
     * @returns A promise that resolves to paginated data containing JWT key information
     *          with metadata about the pagination and an array of JWT key items
     */
    async paginate(
        paginationDto: JwtKeyPaginateV1Request,
    ): Promise<IPaginateData<IJwtKey>> {
        return this.jwtKeyRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a JWT key by their unique identifier
     * @param id - The unique identifier of the JWT key to find
     * @returns Promise resolving to the JWT key object
     * @throws EntityNotFoundError if JWT key with given id does not exist
     */
    async findOneById(id: string): Promise<IJwtKey> {
        return this.jwtKeyRepository.findOneByIdOrFailWithRelations(id, []);
    }

    /**
     * Finds and retrieves an active JWT key by kid
     * @param kid - The kid (Key ID) to find
     * @returns Promise resolving to the JWT key object or null if not found
     */
    async findActiveByKid(kid: string): Promise<IJwtKey | null> {
        return this.jwtKeyRepository.findActiveByKid(kid);
    }

    /**
     * Finds and retrieves all active JWT keys
     * @returns Promise resolving to array of active JWT key objects
     */
    async findAllActive(): Promise<IJwtKey[]> {
        return this.jwtKeyRepository.findAllActive();
    }

    /**
     * Updates a JWT key's information by their ID
     * @param id - The unique identifier of the JWT key to update
     * @param updateDto - The JWT key data to be updated
     * @returns Promise resolving to the updated JWT key object
     * @throws NotFoundException if JWT key with given id does not exist
     */
    async updateById(id: string, updateDto: JwtKeyUpdateV1Request): Promise<IJwtKey> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const jwtKey = await queryRunner.manager.findOne(JwtKey, {
                where: { id },
            });

            if (!jwtKey) {
                throw new NotFoundException('JWT Key not found');
            }

            Object.assign(jwtKey, updateDto);
            const savedJwtKey = await queryRunner.manager.save(jwtKey);
            await queryRunner.commitTransaction();

            return savedJwtKey;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Creates a new JWT key with the provided details
     * @param createDto - The data transfer object containing JWT key creation details
     * @returns Promise resolving to the created JWT key object
     * @throws QueryFailedError if database constraint is violated
     */
    async create(createDto: JwtKeyCreateV1Request): Promise<IJwtKey> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const jwtKey = queryRunner.manager.create(JwtKey, {
                kid: createDto.kid,
                alg: createDto.alg,
                publicJwk: createDto.publicJwk,
                isActive: true,
                note: createDto.note,
                expiresAt: createDto.expiresAt,
            });

            const savedJwtKey = await queryRunner.manager.save(jwtKey);
            await queryRunner.commitTransaction();

            return savedJwtKey;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Rotates a JWT key by marking it as inactive and setting rotation timestamp
     * @param id - The unique identifier of the JWT key to rotate
     * @returns Promise resolving to the rotated JWT key object
     * @throws NotFoundException if JWT key with given id does not exist
     */
    async rotate(id: string): Promise<IJwtKey> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const jwtKey = await queryRunner.manager.findOne(JwtKey, {
                where: { id },
            });

            if (!jwtKey) {
                throw new NotFoundException('JWT Key not found');
            }

            jwtKey.isActive = false;
            jwtKey.rotatedAt = new Date();

            const savedJwtKey = await queryRunner.manager.save(jwtKey);
            await queryRunner.commitTransaction();

            return savedJwtKey;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Soft deletes a JWT key by their ID
     * @param id - The unique identifier of the JWT key to soft delete
     * @returns Promise resolving when the JWT key has been soft deleted
     * @throws NotFoundException if JWT key with given ID is not found
     */
    async softDeleteById(id: string): Promise<void> {
        const jwtKey = await this.jwtKeyRepository.findOneByIdOrFail(id);
        await this.jwtKeyRepository.softRemove(jwtKey);
    }
}
