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
import { ResourceCreateV1Request } from '../dtos/requests/resource-create-v1.request';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';
import { ResourceUpdateV1Request } from '../dtos/requests/resource-update-v1.request';
import { ResourceV1Response } from '../dtos/responses/resource-v1.response';
import { ResourceV1Service } from '../services/resource-v1.service';

@Controller({
    path: 'resources',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class ResourceV1Controller {
    constructor(private readonly resourceV1Service: ResourceV1Service) {}

    @Permission(RESOURCE.RESOURCE, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated resource data based on provided pagination parameters
     *
     * @param {ResourcePaginateV1Request} paginationDto - The pagination parameters for resource data
     * @returns {Promise<IPaginationResponse<ResourceV1Response>>} A promise that resolves to paginated resource response data
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
        @Query() paginationDto: ResourcePaginateV1Request,
    ): Promise<IPaginationResponse<ResourceV1Response>> {
        const result = await this.resourceV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: ResourceV1Response.MapEntities(result.items),
            },

            message: 'Resource pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.RESOURCE, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new resource in the IAM system
     * @param dataCreateDto - The data transfer object containing resource creation details
     * @returns A promise containing a basic response with the created resource data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create resources
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When a resource with the same code already exists
     */
    async create(
        @Body() dataCreateDto: ResourceCreateV1Request,
    ): Promise<IBasicResponse<ResourceV1Response>> {
        const data = await this.resourceV1Service.create(dataCreateDto);

        return {
            data: ResourceV1Response.FromEntity(data),
            message: 'Resource created successfully',
        };
    }

    @Permission(RESOURCE.RESOURCE, [ACTION.VIEW])
    @Get(':resourceId')
    /**
     * Retrieves resource information by their ID.
     *
     * @param {string} resourceId - The unique identifier of the resource to retrieve
     * @returns {Promise<IBasicResponse<ResourceV1Response>>} A promise that resolves to a basic response containing resource data
     * @throws {NotFoundException} When resource with given ID is not found
     */
    async getById(
        @Param('resourceId') resourceId: string,
    ): Promise<IBasicResponse<ResourceV1Response>> {
        const data = await this.resourceV1Service.findOneById(resourceId);

        return {
            data: ResourceV1Response.FromEntity(data),
            message: 'Resource retrieved successfully',
        };
    }

    @Permission(RESOURCE.RESOURCE, [ACTION.UPDATE])
    @Patch(':resourceId')
    /**
     * Updates a resource's information by their ID
     * @param resourceId - The unique identifier of the resource to update
     * @param dataUpdate - The resource data to be updated
     * @returns A promise containing the basic response with updated resource information
     * @throws {NotFoundException} When resource is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('resourceId') resourceId: string,
        @Body() dataUpdate: ResourceUpdateV1Request,
    ): Promise<IBasicResponse<ResourceV1Response>> {
        const data = await this.resourceV1Service.updateById(resourceId, dataUpdate);
        return {
            data: ResourceV1Response.FromEntity(data),
            message: 'Resource updated successfully',
        };
    }

    @Permission(RESOURCE.RESOURCE, [ACTION.DELETE])
    @Delete(':resourceId')
    /**
     * Deletes a resource by their ID (soft delete)
     * @param resourceId - The unique identifier of the resource to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When resource with given ID is not found
     */
    async deleteById(
        @Param('resourceId') resourceId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.resourceV1Service.softDeleteById(resourceId);
        return {
            data: null,
            message: 'Resource deleted successfully',
        };
    }
}
