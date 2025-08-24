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
import { RefreshTokenCreateV1Request } from '../dtos/requests/refresh-token-create-v1.request';
import { RefreshTokenPaginateV1Request } from '../dtos/requests/refresh-token-paginate-v1.request';
import { RefreshTokenUpdateV1Request } from '../dtos/requests/refresh-token-update-v1.request';
import { RefreshTokenV1Response } from '../dtos/responses/refresh-token-v1.response';
import { RefreshTokenV1Service } from '../services/refresh-token-v1.service';

@Controller({
    path: 'refresh-tokens',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class RefreshTokenV1Controller {
    constructor(private readonly refreshTokenV1Service: RefreshTokenV1Service) {}

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated refresh token data based on provided pagination parameters
     *
     * @param {RefreshTokenPaginateV1Request} paginationDto - The pagination parameters for refresh token data
     * @returns {Promise<IPaginationResponse<RefreshTokenV1Response>>} A promise that resolves to paginated refresh token response data
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
        @Query() paginationDto: RefreshTokenPaginateV1Request,
    ): Promise<IPaginationResponse<RefreshTokenV1Response>> {
        const result = await this.refreshTokenV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: RefreshTokenV1Response.MapEntities(result.items),
            },
            message: 'Refresh token pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new refresh token in the IAM system
     * @param dataCreateDto - The data transfer object containing refresh token creation details
     * @returns A promise containing a basic response with the created refresh token data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create refresh tokens
     * @throws {BadRequestException} When the provided data is invalid
     */
    async create(
        @Body() dataCreateDto: RefreshTokenCreateV1Request,
    ): Promise<IBasicResponse<RefreshTokenV1Response>> {
        const data = await this.refreshTokenV1Service.create(dataCreateDto);

        return {
            data: RefreshTokenV1Response.FromEntity(data),
            message: 'Refresh token created successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.VIEW])
    @Get(':refreshTokenId')
    /**
     * Retrieves refresh token information by their ID.
     *
     * @param {string} refreshTokenId - The unique identifier of the refresh token to retrieve
     * @returns {Promise<IBasicResponse<RefreshTokenV1Response>>} A promise that resolves to a basic response containing refresh token data
     * @throws {NotFoundException} When refresh token with given ID is not found
     */
    async getById(
        @Param('refreshTokenId') refreshTokenId: string,
    ): Promise<IBasicResponse<RefreshTokenV1Response>> {
        const data = await this.refreshTokenV1Service.findOneById(refreshTokenId);

        return {
            data: RefreshTokenV1Response.FromEntity(data),
            message: 'Refresh token retrieved successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.VIEW])
    @Get('users/:userId/sessions/:sessionId')
    /**
     * Retrieves refresh token by user and session IDs
     * @param userId - The unique identifier of the user
     * @param sessionId - The unique identifier of the session
     * @returns A promise containing the refresh token data or null if not found
     */
    async findByUserAndSession(
        @Param('userId') userId: string,
        @Param('sessionId') sessionId: string,
    ): Promise<IBasicResponse<RefreshTokenV1Response | null>> {
        const data = await this.refreshTokenV1Service.findByUserAndSession(userId, sessionId);

        return {
            data: data ? RefreshTokenV1Response.FromEntity(data) : null,
            message: data ? 'Refresh token retrieved successfully' : 'Refresh token not found',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.UPDATE])
    @Patch(':refreshTokenId')
    /**
     * Updates a refresh token's information by their ID
     * @param refreshTokenId - The unique identifier of the refresh token to update
     * @param dataUpdate - The refresh token data to be updated
     * @returns A promise containing the basic response with updated refresh token information
     * @throws {NotFoundException} When refresh token is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('refreshTokenId') refreshTokenId: string,
        @Body() dataUpdate: RefreshTokenUpdateV1Request,
    ): Promise<IBasicResponse<RefreshTokenV1Response>> {
        const data = await this.refreshTokenV1Service.updateById(refreshTokenId, dataUpdate);
        return {
            data: RefreshTokenV1Response.FromEntity(data),
            message: 'Refresh token updated successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.UPDATE])
    @Patch(':refreshTokenId/revoke')
    /**
     * Revokes a specific refresh token
     * @param refreshTokenId - The unique identifier of the refresh token to revoke
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When refresh token with given ID is not found
     */
    async revokeToken(
        @Param('refreshTokenId') refreshTokenId: string,
    ): Promise<IBasicResponse<null>> {
        await this.refreshTokenV1Service.revoke(refreshTokenId);

        return {
            data: null,
            message: 'Refresh token revoked successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.UPDATE])
    @Post('cleanup-expired')
    /**
     * Cleans up expired refresh tokens
     * @returns A promise resolving to a basic response containing null data and success message
     */
    async cleanupExpiredTokens(): Promise<IBasicResponse<null>> {
        await this.refreshTokenV1Service.cleanupExpiredTokens();

        return {
            data: null,
            message: 'Expired tokens cleaned up successfully',
        };
    }

    @Permission(RESOURCE.REFRESH_TOKEN, [ACTION.DELETE])
    @Delete(':refreshTokenId')
    /**
     * Deletes a refresh token by their ID (soft delete)
     * @param refreshTokenId - The unique identifier of the refresh token to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When refresh token with given ID is not found
     */
    async deleteById(
        @Param('refreshTokenId') refreshTokenId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.refreshTokenV1Service.softDeleteById(refreshTokenId);
        return {
            data: null,
            message: 'Refresh token deleted successfully',
        };
    }
}