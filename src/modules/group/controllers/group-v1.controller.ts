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
import { GroupCreateV1Request } from '../dtos/requests/group-create-v1.request';
import { GroupUpdateV1Request } from '../dtos/requests/group-update-v1.request';
import { GroupPaginateV1Request } from '../dtos/requests/group-paginate-v1.request';
import { GroupV1Response, GroupDetailV1Response } from '../dtos/responses/group-v1.response';
import { GroupV1Service } from '../services/group-v1.service';

@Controller({
    path: 'groups',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class GroupV1Controller {
    constructor(private readonly groupV1Service: GroupV1Service) {}

    @Permission(RESOURCE.GROUP, [ACTION.VIEW])
    @Get()
    /**
     * Retrieves paginated group data based on provided pagination parameters
     *
     * @param {GroupPaginateV1Request} paginationDto - The pagination parameters for group data
     * @returns {Promise<IPaginationResponse<GroupV1Response>>} A promise that resolves to paginated group response data
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
        @Query() paginationDto: GroupPaginateV1Request,
    ): Promise<IPaginationResponse<GroupV1Response>> {
        const result = await this.groupV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: GroupV1Response.MapEntities(result.items),
            },
            message: 'Group pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.GROUP, [ACTION.CREATE])
    @Post()
    /**
     * Creates a new group in the IAM system
     * @param dataCreateDto - The data transfer object containing group creation details
     * @returns A promise containing a basic response with the created group data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create groups
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When a group with the same code already exists in the organization
     */
    async create(
        @Body() dataCreateDto: GroupCreateV1Request,
    ): Promise<IBasicResponse<GroupV1Response>> {
        const data = await this.groupV1Service.create(dataCreateDto);

        return {
            data: GroupV1Response.FromEntity(data),
            message: 'Group created successfully',
        };
    }

    @Permission(RESOURCE.GROUP, [ACTION.VIEW])
    @Get(':groupId')
    /**
     * Retrieves group information by their ID.
     *
     * @param {string} groupId - The unique identifier of the group to retrieve
     * @returns {Promise<IBasicResponse<GroupDetailV1Response>>} A promise that resolves to a basic response containing group data
     * @throws {NotFoundException} When group with given ID is not found
     */
    async getById(
        @Param('groupId') groupId: string,
    ): Promise<IBasicResponse<GroupDetailV1Response>> {
        const data = await this.groupV1Service.findOneByIdWithRelations(groupId);

        return {
            data: GroupDetailV1Response.FromEntity(data),
            message: 'Group retrieved successfully',
        };
    }

    @Permission(RESOURCE.GROUP, [ACTION.UPDATE])
    @Patch(':groupId')
    /**
     * Updates a group's information by their ID
     * @param groupId - The unique identifier of the group to update
     * @param dataUpdate - The group data to be updated
     * @returns A promise containing the basic response with updated group information
     * @throws {NotFoundException} When group is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('groupId') groupId: string,
        @Body() dataUpdate: GroupUpdateV1Request,
    ): Promise<IBasicResponse<GroupV1Response>> {
        const data = await this.groupV1Service.updateById(groupId, dataUpdate);
        return {
            data: GroupV1Response.FromEntity(data),
            message: 'Group updated successfully',
        };
    }

    @Permission(RESOURCE.GROUP, [ACTION.DELETE])
    @Delete(':groupId')
    /**
     * Deletes a group by their ID (soft delete)
     * @param groupId - The unique identifier of the group to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When group with given ID is not found
     */
    async deleteById(
        @Param('groupId') groupId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.groupV1Service.softDeleteById(groupId);
        return {
            data: null,
            message: 'Group deleted successfully',
        };
    }
}