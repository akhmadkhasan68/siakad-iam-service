import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Param, 
    Query, 
    Body 
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/auth/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/auth/shared/enums/token-type.enum';
import { ACTION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { SessionCreateV1Request } from '../dtos/requests/session-create-v1.request';
import { SessionPaginateV1Request } from '../dtos/requests/session-paginate-v1.request';
import { SessionUpdateV1Request } from '../dtos/requests/session-update-v1.request';
import { SessionV1Response } from '../dtos/responses/session-v1.response';
import { SessionV1Service } from '../services/session-v1.service';

@Controller({
    path: 'sessions',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class SessionV1Controller {
    constructor(private readonly sessionV1Service: SessionV1Service) {}

    @Permission(RESOURCE.SESSION, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated session data based on provided pagination parameters
     *
     * @param {SessionPaginateV1Request} paginationDto - The pagination parameters for session data
     * @returns {Promise<IPaginationResponse<SessionV1Response>>} A promise that resolves to paginated session response data
     *
     * @example
     * const result = await paginate({
     *   page: 1,
     *   limit: 10
     * });
     *
     * @throws {Error} If pagination operation fails
     */
    async paginate(
        @Query() paginationDto: SessionPaginateV1Request,
    ): Promise<IPaginationResponse<SessionV1Response>> {
        const result = await this.sessionV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: SessionV1Response.MapEntities(result.items),
            },
            message: 'Session pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new session in the IAM system
     * @param dataCreateDto - The data transfer object containing session creation details
     * @returns A promise containing a basic response with the created session data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create sessions
     * @throws {BadRequestException} When the provided data is invalid
     */
    async create(
        @Body() dataCreateDto: SessionCreateV1Request,
    ): Promise<IBasicResponse<SessionV1Response>> {
        const data = await this.sessionV1Service.create(dataCreateDto);

        return {
            data: SessionV1Response.FromEntity(data),
            message: 'Session created successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.VIEW])
    @Get(':sessionId')
    /**
     * Retrieves session information by their ID.
     *
     * @param {string} sessionId - The unique identifier of the session to retrieve
     * @returns {Promise<IBasicResponse<SessionV1Response>>} A promise that resolves to a basic response containing session data
     * @throws {NotFoundException} When session with given ID is not found
     */
    async getById(
        @Param('sessionId') sessionId: string,
    ): Promise<IBasicResponse<SessionV1Response>> {
        const data = await this.sessionV1Service.findOneById(sessionId);

        return {
            data: SessionV1Response.FromEntity(data),
            message: 'Session retrieved successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.VIEW])
    @Get('users/:userId/active')
    /**
     * Retrieves active sessions for a specific user
     * @param userId - The unique identifier of the user
     * @returns A promise containing active sessions for the user
     * @throws {NotFoundException} When user is not found
     */
    async findActiveByUser(
        @Param('userId') userId: string,
    ): Promise<IBasicResponse<SessionV1Response[]>> {
        const data = await this.sessionV1Service.findActiveSessionsByUser(userId);

        return {
            data: SessionV1Response.MapEntities(data),
            message: 'Active sessions retrieved successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.UPDATE])
    @Patch(':sessionId')
    /**
     * Updates a session's information by their ID
     * @param sessionId - The unique identifier of the session to update
     * @param dataUpdate - The session data to be updated
     * @returns A promise containing the basic response with updated session information
     * @throws {NotFoundException} When session is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('sessionId') sessionId: string,
        @Body() dataUpdate: SessionUpdateV1Request,
    ): Promise<IBasicResponse<SessionV1Response>> {
        const data = await this.sessionV1Service.updateById(sessionId, dataUpdate);
        return {
            data: SessionV1Response.FromEntity(data),
            message: 'Session updated successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.UPDATE])
    @Patch(':sessionId/revoke')
    /**
     * Revokes a specific session
     * @param sessionId - The unique identifier of the session to revoke
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When session with given ID is not found
     */
    async revokeSession(
        @Param('sessionId') sessionId: string,
    ): Promise<IBasicResponse<null>> {
        await this.sessionV1Service.revoke(sessionId);

        return {
            data: null,
            message: 'Session revoked successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.UPDATE])
    @Patch('users/:userId/revoke-all')
    /**
     * Revokes all sessions for a specific user
     * @param userId - The unique identifier of the user whose sessions should be revoked
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When user is not found
     */
    async revokeUserSessions(
        @Param('userId') userId: string,
    ): Promise<IBasicResponse<null>> {
        await this.sessionV1Service.revokeUserSessions(userId);

        return {
            data: null,
            message: 'All user sessions revoked successfully',
        };
    }

    @Permission(RESOURCE.SESSION, [ACTION.DELETE])
    @Delete(':sessionId')
    /**
     * Deletes a session by their ID (soft delete)
     * @param sessionId - The unique identifier of the session to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When session with given ID is not found
     */
    async deleteById(
        @Param('sessionId') sessionId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.sessionV1Service.softDeleteById(sessionId);
        return {
            data: null,
            message: 'Session deleted successfully',
        };
    }
}