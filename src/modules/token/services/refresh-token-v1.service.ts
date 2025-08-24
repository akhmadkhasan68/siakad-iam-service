import { Injectable, NotFoundException } from '@nestjs/common';
import { RefreshToken } from 'src/infrastructures/databases/entities/refresh-token.entity';
import { IRefreshToken } from 'src/infrastructures/databases/interfaces/refresh-token.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { RefreshTokenCreateV1Request } from '../dtos/requests/refresh-token-create-v1.request';
import { RefreshTokenPaginateV1Request } from '../dtos/requests/refresh-token-paginate-v1.request';
import { RefreshTokenUpdateV1Request } from '../dtos/requests/refresh-token-update-v1.request';
import { RefreshTokenV1Repository } from '../repositories/refresh-token-v1.repository';

@Injectable()
export class RefreshTokenV1Service {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves a paginated list of refresh tokens based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching refresh tokens
     * @returns A promise that resolves to paginated data containing refresh token information
     *          with metadata about the pagination and an array of refresh token items
     */
    async paginate(
        paginationDto: RefreshTokenPaginateV1Request,
    ): Promise<IPaginateData<IRefreshToken>> {
        return await this.refreshTokenRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a refresh token by their unique identifier
     * @param id - The unique identifier of the refresh token to find
     * @returns Promise resolving to the refresh token object
     * @throws EntityNotFoundError if refresh token with given id does not exist
     */
    async findOneById(id: string): Promise<IRefreshToken> {
        return await this.refreshTokenRepository.findOneByIdOrFailWithRelations(id, []);
    }

    /**
     * Finds and retrieves a refresh token by token string
     * @param token - The token string to find
     * @returns Promise resolving to the refresh token object or null if not found
     */
    async findByToken(token: string): Promise<IRefreshToken | null> {
        return await this.refreshTokenRepository.findByToken(token);
    }

    /**
     * Finds and retrieves a refresh token by user and session
     * @param userId - The user ID to find
     * @param sessionId - The session ID to find
     * @returns Promise resolving to the refresh token object or null if not found
     */
    async findByUserAndSession(
        userId: string,
        sessionId: string,
    ): Promise<IRefreshToken | null> {
        return this.refreshTokenRepository.findByUserAndSession(
            userId,
            sessionId,
        );
    }

    /**
     * Updates a refresh token's information by their ID
     * @param id - The unique identifier of the refresh token to update
     * @param updateDto - The refresh token data to be updated
     * @returns Promise resolving to the updated refresh token object
     * @throws NotFoundException if refresh token with given id does not exist
     */
    async updateById(id: string, updateDto: RefreshTokenUpdateV1Request): Promise<IRefreshToken> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const refreshToken = await queryRunner.manager.findOne(RefreshToken, {
                where: { id },
            });

            if (!refreshToken) {
                throw new NotFoundException('Refresh token not found');
            }

            Object.assign(refreshToken, updateDto);
            const savedRefreshToken = await queryRunner.manager.save(refreshToken);
            await queryRunner.commitTransaction();

            return savedRefreshToken;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Creates a new refresh token with the provided details
     * @param createDto - The data transfer object containing refresh token creation details
     * @returns Promise resolving to the created refresh token object
     * @throws QueryFailedError if database constraint is violated
     */
    async create(createDto: RefreshTokenCreateV1Request): Promise<IRefreshToken> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Revoke existing refresh token for this user/session combination
            const existingToken =
                await this.refreshTokenRepository.findByUserAndSession(
                    createDto.userId,
                    createDto.sessionId,
                );

            if (existingToken) {
                existingToken.revokedAt = new Date();
                await queryRunner.manager.save(existingToken);
            }

            const refreshToken = queryRunner.manager.create(RefreshToken, {
                userId: createDto.userId,
                sessionId: createDto.sessionId,
                token: createDto.token,
                ip: createDto.ip,
                userAgent: createDto.userAgent,
                issuedAt: new Date(),
                expiresAt: createDto.expiresAt,
            });

            const savedRefreshToken =
                await queryRunner.manager.save(refreshToken);
            await queryRunner.commitTransaction();

            return savedRefreshToken;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Revokes a refresh token by setting revoked timestamp
     * @param id - The unique identifier of the refresh token to revoke
     * @returns Promise resolving when the token has been revoked
     * @throws NotFoundException if refresh token with given id does not exist
     */
    async revoke(id: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const refreshToken = await queryRunner.manager.findOne(
                RefreshToken,
                {
                    where: { id },
                },
            );

            if (!refreshToken) {
                throw new NotFoundException('Refresh token not found');
            }

            refreshToken.revokedAt = new Date();
            await queryRunner.manager.save(refreshToken);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Revokes a refresh token by token string
     * @param token - The token string to revoke
     * @returns Promise resolving when the token has been revoked
     * @throws NotFoundException if token is not found
     */
    async revokeByToken(token: string): Promise<void> {
        const refreshToken =
            await this.refreshTokenRepository.findByToken(token);

        if (!refreshToken) {
            throw new NotFoundException('Refresh token not found');
        }

        await this.revoke(refreshToken.id);
    }

    /**
     * Cleans up expired refresh tokens
     * @returns Promise resolving when expired tokens have been cleaned up
     */
    async cleanupExpiredTokens(): Promise<void> {
        await this.refreshTokenRepository.revokeExpiredTokens();
    }

    /**
     * Soft deletes a refresh token by their ID
     * @param id - The unique identifier of the refresh token to soft delete
     * @returns Promise resolving when the refresh token has been soft deleted
     * @throws NotFoundException if refresh token with given ID is not found
     */
    async softDeleteById(id: string): Promise<void> {
        const refreshToken =
            await this.refreshTokenRepository.findOneByIdOrFail(id);
        await this.refreshTokenRepository.softRemove(refreshToken);
    }
}
