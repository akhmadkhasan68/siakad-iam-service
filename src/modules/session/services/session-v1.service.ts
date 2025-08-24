import { Injectable, NotFoundException } from '@nestjs/common';
import { Session } from 'src/infrastructures/databases/entities/session.entity';
import { ISession } from 'src/infrastructures/databases/interfaces/session.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource, QueryFailedError } from 'typeorm';
import { SessionCreateV1Request } from '../dtos/requests/session-create-v1.request';
import { SessionPaginateV1Request } from '../dtos/requests/session-paginate-v1.request';
import { SessionUpdateV1Request } from '../dtos/requests/session-update-v1.request';
import { SessionV1Repository } from '../repositories/session-v1.repository';

@Injectable()
export class SessionV1Service {
    constructor(
        private readonly sessionRepository: SessionV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Retrieves a paginated list of sessions based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching sessions
     * @returns A promise that resolves to paginated data containing session information
     *          with metadata about the pagination and an array of session items
     */
    async paginate(
        paginationDto: SessionPaginateV1Request,
    ): Promise<IPaginateData<ISession>> {
        return await this.sessionRepository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a session by their unique identifier
     * @param id - The unique identifier of the session to find
     * @returns Promise resolving to the session object
     * @throws EntityNotFoundError if session with given id does not exist
     */
    async findOneById(id: string): Promise<ISession> {
        return this.sessionRepository.findOneByIdOrFailWithRelations(id, []);
    }

    async findActiveSessionsByUser(userId: string): Promise<ISession[]> {
        return await this.sessionRepository.findActiveSessionsByUser(userId);
    }

    /**
     * Creates a new session in the system
     *
     * @param dataCreate - The session creation data containing user ID and optional metadata
     * @returns Promise resolving to the newly created session object
     *
     * @throws {Error} If session creation fails
     */
    async create(dataCreate: SessionCreateV1Request): Promise<ISession> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const session = queryRunner.manager.create(Session, {
                userId: dataCreate.userId,
                ip: dataCreate.ip,
                userAgent: dataCreate.userAgent,
                lastSeenAt: new Date(),
            });

            const savedSession = await queryRunner.manager.save(session);
            await queryRunner.commitTransaction();

            return savedSession;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Updates a session by their ID with the provided data
     * @param sessionId - The unique identifier of the session to update
     * @param dataUpdate - The data to update the session with
     * @returns Promise resolving to the updated session object
     * @throws {NotFoundException} If session with given ID is not found
     */
    async updateById(
        sessionId: string,
        dataUpdate: SessionUpdateV1Request,
    ): Promise<ISession> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const session = await queryRunner.manager.findOne(Session, {
                where: { id: sessionId },
            });

            if (!session) {
                throw new NotFoundException('Session not found');
            }

            Object.assign(session, {
                ...dataUpdate,
                lastSeenAt: dataUpdate.lastSeenAt || new Date(),
            });

            const savedSession = await queryRunner.manager.save(session);
            await queryRunner.commitTransaction();

            return savedSession;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async revoke(id: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const session = await queryRunner.manager.findOne(Session, {
                where: { id },
            });

            if (!session) {
                throw new NotFoundException('Session not found');
            }

            session.revokedAt = new Date();
            await queryRunner.manager.save(session);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async revokeUserSessions(userId: string): Promise<void> {
        return this.sessionRepository.revokeUserSessions(userId);
    }

    /**
     * Performs a soft delete operation on a session record by ID.
     *
     * @param id - The unique identifier of the session to be soft deleted
     * @returns A promise that resolves to true if the deletion was successful
     * @throws QueryFailedError - If no records were affected by the delete operation
     */
    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.sessionRepository.softDelete({ id });
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
