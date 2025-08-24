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
import { OrganizationCreateV1Request } from '../dtos/requests/organization-create-v1.request';
import { OrganizationPaginateV1Request } from '../dtos/requests/organization-paginate-v1.request';
import { OrganizationUpdateV1Request } from '../dtos/requests/organization-update-v1.request';
import { OrganizationV1Response } from '../dtos/responses/organization-v1.response';
import { OrganizationV1Service } from '../services/organization-v1.service';

@Controller({
    path: 'organizations',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class OrganizationV1Controller {
    constructor(private readonly organizationV1Service: OrganizationV1Service) {}

    @Permission(RESOURCE.ORGANIZATION, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated organization data based on provided pagination parameters
     *
     * @param {OrganizationPaginateV1Request} paginationDto - The pagination parameters for organization data
     * @returns {Promise<IPaginationResponse<OrganizationV1Response>>} A promise that resolves to paginated organization response data
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
        @Query() paginationDto: OrganizationPaginateV1Request,
    ): Promise<IPaginationResponse<OrganizationV1Response>> {
        const result = await this.organizationV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: OrganizationV1Response.MapEntities(result.items),
            },
            message: 'Organization pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.ORGANIZATION, [ACTION.VIEW])
    @Get(':organizationId')
    /**
     * Retrieves organization information by their ID.
     *
     * @param {string} organizationId - The unique identifier of the organization to retrieve
     * @returns {Promise<IBasicResponse<OrganizationV1Response>>} A promise that resolves to a basic response containing organization data
     * @throws {NotFoundException} When organization with given ID is not found
     */
    async getById(
        @Param('organizationId') organizationId: string,
    ): Promise<IBasicResponse<OrganizationV1Response>> {
        const result = await this.organizationV1Service.findOneById(organizationId);

        return {
            data: OrganizationV1Response.FromEntity(result),
            message: 'Organization retrieved successfully',
        };
    }

    @Permission(RESOURCE.ORGANIZATION, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new organization in the IAM system
     * @param dataCreateDto - The data transfer object containing organization creation details
     * @returns A promise containing a basic response with the created organization data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create organizations
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When an organization with the same code already exists
     */
    async create(
        @Body() dataCreateDto: OrganizationCreateV1Request,
    ): Promise<IBasicResponse<OrganizationV1Response>> {
        const result = await this.organizationV1Service.create(dataCreateDto);

        return {
            data: OrganizationV1Response.FromEntity(result),
            message: 'Organization created successfully',
        };
    }

    @Permission(RESOURCE.ORGANIZATION, [ACTION.UPDATE])
    @Patch(':organizationId')
    /**
     * Updates an organization's information by their ID
     * @param organizationId - The unique identifier of the organization to update
     * @param dataUpdate - The organization data to be updated
     * @returns A promise containing the basic response with updated organization information
     * @throws {NotFoundException} When organization is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('organizationId') organizationId: string,
        @Body() dataUpdate: OrganizationUpdateV1Request,
    ): Promise<IBasicResponse<OrganizationV1Response>> {
        const result = await this.organizationV1Service.updateById(organizationId, dataUpdate);

        return {
            data: OrganizationV1Response.FromEntity(result),
            message: 'Organization updated successfully',
        };
    }

    @Permission(RESOURCE.ORGANIZATION, [ACTION.DELETE])
    @Delete(':organizationId')
    /**
     * Deletes an organization by their ID (soft delete)
     * @param organizationId - The unique identifier of the organization to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When organization with given ID is not found
     */
    async deleteById(
        @Param('organizationId') organizationId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.organizationV1Service.softDeleteById(organizationId);

        return {
            data: null,
            message: 'Organization deleted successfully',
        };
    }
}