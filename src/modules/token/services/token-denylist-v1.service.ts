import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TokenDenylist } from 'src/infrastructures/databases/entities/token-denylist.entity';
import { ITokenDenylist } from 'src/infrastructures/databases/interfaces/token-denylist.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { TokenDenylistCreateV1Request } from '../dtos/requests/token-denylist-create-v1.request';
import { TokenDenylistPaginateV1Request } from '../dtos/requests/token-denylist-paginate-v1.request';
import { TokenDenylistUpdateV1Request } from '../dtos/requests/token-denylist-update-v1.request';
import { TokenDenylistV1Repository } from '../repositories/token-denylist-v1.repository';

@Injectable()
export class TokenDenylistV1Service {
    constructor(
        private readonly tokenDenylistRepository: TokenDenylistV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves a paginated list of token denylist entries based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching token denylist entries
     * @returns A promise that resolves to paginated data containing token denylist information
     *          with metadata about the pagination and an array of token denylist items
     */
    async paginate(
        paginationDto: TokenDenylistPaginateV1Request,
    ): Promise<IPaginateData<ITokenDenylist>> {
        return this.tokenDenylistRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a token denylist entry by their unique identifier
     * @param id - The unique identifier of the token denylist entry to find
     * @returns Promise resolving to the token denylist entry object
     * @throws EntityNotFoundError if token denylist entry with given id does not exist
     */
    async findOneById(id: string): Promise<ITokenDenylist> {
        return this.tokenDenylistRepository.findOneByIdOrFailWithRelations(id, []);
    }

    /**
     * Finds and retrieves a token denylist entry by JTI
     * @param jti - The JTI to find
     * @returns Promise resolving to the token denylist entry object or null if not found
     */
    async findByJti(jti: string): Promise<ITokenDenylist | null> {
        return this.tokenDenylistRepository.findByJti(jti);
    }

    /**
     * Checks if a token is blacklisted by JTI
     * @param jti - The JTI to check
     * @returns Promise resolving to boolean indicating if token is blacklisted
     */
    async isTokenBlacklisted(jti: string): Promise<boolean> {
        return this.tokenDenylistRepository.isTokenBlacklisted(jti);
    }

    /**
     * Updates a token denylist entry's information by their ID
     * @param id - The unique identifier of the token denylist entry to update
     * @param updateDto - The token denylist entry data to be updated
     * @returns Promise resolving to the updated token denylist entry object
     * @throws NotFoundException if token denylist entry with given id does not exist
     */
    async updateById(id: string, updateDto: TokenDenylistUpdateV1Request): Promise<ITokenDenylist> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const tokenDenylist = await queryRunner.manager.findOne(TokenDenylist, {
                where: { id },
            });

            if (!tokenDenylist) {
                throw new NotFoundException('Token denylist entry not found');
            }

            Object.assign(tokenDenylist, updateDto);
            const savedTokenDenylist = await queryRunner.manager.save(tokenDenylist);
            await queryRunner.commitTransaction();

            return savedTokenDenylist;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Creates a new token denylist entry (blacklists a token)
     * @param createDto - The data transfer object containing token denylist creation details
     * @returns Promise resolving to the created token denylist entry object
     * @throws QueryFailedError if database constraint is violated
     * @throws ConflictException if token is already blacklisted
     */
    async create(
        createDto: TokenDenylistCreateV1Request,
    ): Promise<ITokenDenylist> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if token is already blacklisted
            const existingEntry = await this.tokenDenylistRepository.findByJti(
                createDto.jti,
            );

            if (existingEntry) {
                throw new ConflictException('Token is already blacklisted');
            }

            const denylistEntry = queryRunner.manager.create(TokenDenylist, {
                jti: createDto.jti,
                reason: createDto.reason || 'Token revoked',
                expiresAt: createDto.expiresAt,
            });

            const savedEntry = await queryRunner.manager.save(denylistEntry);
            await queryRunner.commitTransaction();

            return savedEntry;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Cleans up expired token denylist entries
     * @returns Promise resolving when expired entries have been cleaned up
     */
    async cleanupExpiredTokens(): Promise<void> {
        await this.tokenDenylistRepository.cleanupExpiredTokens();
    }

    /**
     * Soft deletes a token denylist entry by their ID
     * @param id - The unique identifier of the token denylist entry to soft delete
     * @returns Promise resolving when the entry has been soft deleted
     * @throws NotFoundException if entry with given ID is not found
     */
    async softDeleteById(id: string): Promise<void> {
        const denylistEntry =
            await this.tokenDenylistRepository.findOneByIdOrFail(id);
        await this.tokenDenylistRepository.softRemove(denylistEntry);
    }
}
