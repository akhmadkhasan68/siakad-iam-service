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
import { TokenDenylistCreateV1Request } from '../dtos/requests/token-denylist-create-v1.request';
import { TokenDenylistPaginateV1Request } from '../dtos/requests/token-denylist-paginate-v1.request';
import { TokenDenylistUpdateV1Request } from '../dtos/requests/token-denylist-update-v1.request';
import { TokenDenylistV1Response } from '../dtos/responses/token-denylist-v1.response';
import { TokenDenylistV1Service } from '../services/token-denylist-v1.service';

@Controller({
    path: 'token-denylist',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class TokenDenylistV1Controller {
    constructor(private readonly tokenDenylistV1Service: TokenDenylistV1Service) {}

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated token denylist data based on provided pagination parameters
     *
     * @param {TokenDenylistPaginateV1Request} paginationDto - The pagination parameters for token denylist data
     * @returns {Promise<IPaginationResponse<TokenDenylistV1Response>>} A promise that resolves to paginated token denylist response data
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
        @Query() paginationDto: TokenDenylistPaginateV1Request,
    ): Promise<IPaginationResponse<TokenDenylistV1Response>> {
        const result = await this.tokenDenylistV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: TokenDenylistV1Response.MapEntities(result.items),
            },
            message: 'Token denylist pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new token denylist entry (blacklists a token)
     * @param dataCreateDto - The data transfer object containing token denylist creation details
     * @returns A promise containing a basic response with the created token denylist data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create token denylist entries
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When a token with the same JTI is already blacklisted
     */
    async create(
        @Body() dataCreateDto: TokenDenylistCreateV1Request,
    ): Promise<IBasicResponse<TokenDenylistV1Response>> {
        const data = await this.tokenDenylistV1Service.create(dataCreateDto);

        return {
            data: TokenDenylistV1Response.FromEntity(data),
            message: 'Token blacklisted successfully',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.VIEW])
    @Get(':tokenDenylistId')
    /**
     * Retrieves token denylist entry information by their ID.
     *
     * @param {string} tokenDenylistId - The unique identifier of the token denylist entry to retrieve
     * @returns {Promise<IBasicResponse<TokenDenylistV1Response>>} A promise that resolves to a basic response containing token denylist data
     * @throws {NotFoundException} When token denylist entry with given ID is not found
     */
    async getById(
        @Param('tokenDenylistId') tokenDenylistId: string,
    ): Promise<IBasicResponse<TokenDenylistV1Response>> {
        const data = await this.tokenDenylistV1Service.findOneById(tokenDenylistId);

        return {
            data: TokenDenylistV1Response.FromEntity(data),
            message: 'Token denylist entry retrieved successfully',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.VIEW])
    @Get('check/:jti')
    /**
     * Checks if a token is blacklisted by JTI
     * @param jti - The JTI (JWT ID) to check
     * @returns A promise containing information about whether the token is blacklisted
     */
    async checkToken(
        @Param('jti') jti: string,
    ): Promise<IBasicResponse<{ isBlacklisted: boolean }>> {
        const isBlacklisted = await this.tokenDenylistV1Service.isTokenBlacklisted(jti);

        return {
            data: { isBlacklisted },
            message: isBlacklisted ? 'Token is blacklisted' : 'Token is not blacklisted',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.UPDATE])
    @Patch(':tokenDenylistId')
    /**
     * Updates a token denylist entry's information by their ID
     * @param tokenDenylistId - The unique identifier of the token denylist entry to update
     * @param dataUpdate - The token denylist data to be updated
     * @returns A promise containing the basic response with updated token denylist information
     * @throws {NotFoundException} When token denylist entry is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('tokenDenylistId') tokenDenylistId: string,
        @Body() dataUpdate: TokenDenylistUpdateV1Request,
    ): Promise<IBasicResponse<TokenDenylistV1Response>> {
        const data = await this.tokenDenylistV1Service.updateById(tokenDenylistId, dataUpdate);
        return {
            data: TokenDenylistV1Response.FromEntity(data),
            message: 'Token denylist entry updated successfully',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.UPDATE])
    @Post('cleanup-expired')
    /**
     * Cleans up expired token denylist entries
     * @returns A promise resolving to a basic response containing null data and success message
     */
    async cleanupExpiredTokens(): Promise<IBasicResponse<null>> {
        await this.tokenDenylistV1Service.cleanupExpiredTokens();

        return {
            data: null,
            message: 'Expired denylist entries cleaned up successfully',
        };
    }

    @Permission(RESOURCE.TOKEN_DENYLIST, [ACTION.DELETE])
    @Delete(':tokenDenylistId')
    /**
     * Deletes a token denylist entry by their ID (soft delete)
     * @param tokenDenylistId - The unique identifier of the token denylist entry to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When token denylist entry with given ID is not found
     */
    async deleteById(
        @Param('tokenDenylistId') tokenDenylistId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.tokenDenylistV1Service.softDeleteById(tokenDenylistId);
        return {
            data: null,
            message: 'Token denylist entry deleted successfully',
        };
    }
}