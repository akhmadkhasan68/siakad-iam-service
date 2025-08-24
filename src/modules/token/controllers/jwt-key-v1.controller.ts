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
import { JwtKeyCreateV1Request } from '../dtos/requests/jwt-key-create-v1.request';
import { JwtKeyPaginateV1Request } from '../dtos/requests/jwt-key-paginate-v1.request';
import { JwtKeyUpdateV1Request } from '../dtos/requests/jwt-key-update-v1.request';
import { JwtKeyV1Response } from '../dtos/responses/jwt-key-v1.response';
import { JwtKeyV1Service } from '../services/jwt-key-v1.service';

@Controller({
    path: 'jwt-keys',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class JwtKeyV1Controller {
    constructor(private readonly jwtKeyV1Service: JwtKeyV1Service) {}

    @Permission(RESOURCE.JWT_KEY, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated JWT key data based on provided pagination parameters
     *
     * @param {JwtKeyPaginateV1Request} paginationDto - The pagination parameters for JWT key data
     * @returns {Promise<IPaginationResponse<JwtKeyV1Response>>} A promise that resolves to paginated JWT key response data
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
        @Query() paginationDto: JwtKeyPaginateV1Request,
    ): Promise<IPaginationResponse<JwtKeyV1Response>> {
        const result = await this.jwtKeyV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: JwtKeyV1Response.MapEntities(result.items),
            },
            message: 'JWT key pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.VIEW])
    @Get('active')
    /**
     * Retrieves all active JWT keys
     * @returns A promise containing all active JWT keys
     */
    async findAllActive(): Promise<IBasicResponse<JwtKeyV1Response[]>> {
        const data = await this.jwtKeyV1Service.findAllActive();

        return {
            data: JwtKeyV1Response.MapEntities(data),
            message: 'Active JWT keys retrieved successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new JWT key in the IAM system
     * @param dataCreateDto - The data transfer object containing JWT key creation details
     * @returns A promise containing a basic response with the created JWT key data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create JWT keys
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When a JWT key with the same kid already exists
     */
    async create(
        @Body() dataCreateDto: JwtKeyCreateV1Request,
    ): Promise<IBasicResponse<JwtKeyV1Response>> {
        const data = await this.jwtKeyV1Service.create(dataCreateDto);

        return {
            data: JwtKeyV1Response.FromEntity(data),
            message: 'JWT key created successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.VIEW])
    @Get(':jwtKeyId')
    /**
     * Retrieves JWT key information by their ID.
     *
     * @param {string} jwtKeyId - The unique identifier of the JWT key to retrieve
     * @returns {Promise<IBasicResponse<JwtKeyV1Response>>} A promise that resolves to a basic response containing JWT key data
     * @throws {NotFoundException} When JWT key with given ID is not found
     */
    async getById(
        @Param('jwtKeyId') jwtKeyId: string,
    ): Promise<IBasicResponse<JwtKeyV1Response>> {
        const data = await this.jwtKeyV1Service.findOneById(jwtKeyId);

        return {
            data: JwtKeyV1Response.FromEntity(data),
            message: 'JWT key retrieved successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.VIEW])
    @Get('kid/:kid')
    /**
     * Retrieves JWT key by kid (Key ID)
     * @param kid - The kid (Key ID) of the JWT key to retrieve
     * @returns A promise containing the JWT key data or null if not found
     */
    async findByKid(
        @Param('kid') kid: string,
    ): Promise<IBasicResponse<JwtKeyV1Response | null>> {
        const data = await this.jwtKeyV1Service.findActiveByKid(kid);

        return {
            data: data ? JwtKeyV1Response.FromEntity(data) : null,
            message: data ? 'JWT key retrieved successfully' : 'JWT key not found',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.UPDATE])
    @Patch(':jwtKeyId')
    /**
     * Updates a JWT key's information by their ID
     * @param jwtKeyId - The unique identifier of the JWT key to update
     * @param dataUpdate - The JWT key data to be updated
     * @returns A promise containing the basic response with updated JWT key information
     * @throws {NotFoundException} When JWT key is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('jwtKeyId') jwtKeyId: string,
        @Body() dataUpdate: JwtKeyUpdateV1Request,
    ): Promise<IBasicResponse<JwtKeyV1Response>> {
        const data = await this.jwtKeyV1Service.updateById(jwtKeyId, dataUpdate);
        return {
            data: JwtKeyV1Response.FromEntity(data),
            message: 'JWT key updated successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.UPDATE])
    @Patch(':jwtKeyId/rotate')
    /**
     * Rotates a JWT key (marks it as inactive)
     * @param jwtKeyId - The unique identifier of the JWT key to rotate
     * @returns A promise containing the updated JWT key data
     * @throws {NotFoundException} When JWT key with given ID is not found
     */
    async rotateKey(
        @Param('jwtKeyId') jwtKeyId: string,
    ): Promise<IBasicResponse<JwtKeyV1Response>> {
        const data = await this.jwtKeyV1Service.rotate(jwtKeyId);

        return {
            data: JwtKeyV1Response.FromEntity(data),
            message: 'JWT key rotated successfully',
        };
    }

    @Permission(RESOURCE.JWT_KEY, [ACTION.DELETE])
    @Delete(':jwtKeyId')
    /**
     * Deletes a JWT key by their ID (soft delete)
     * @param jwtKeyId - The unique identifier of the JWT key to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When JWT key with given ID is not found
     */
    async deleteById(
        @Param('jwtKeyId') jwtKeyId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.jwtKeyV1Service.softDeleteById(jwtKeyId);
        return {
            data: null,
            message: 'JWT key deleted successfully',
        };
    }
}