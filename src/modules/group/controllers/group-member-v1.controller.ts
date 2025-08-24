import { 
    Controller, 
    Get, 
    Post, 
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
import { GroupMemberCreateV1Request } from '../dtos/requests/group-member-create-v1.request';
import { GroupMemberPaginateV1Request } from '../dtos/requests/group-member-paginate-v1.request';
import { GroupMemberV1Response, GroupMemberDetailV1Response } from '../dtos/responses/group-member-v1.response';
import { GroupMemberV1Service } from '../services/group-member-v1.service';

@Controller({
    path: 'group-members',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class GroupMemberV1Controller {
    constructor(private readonly groupMemberV1Service: GroupMemberV1Service) {}

    @Permission(RESOURCE.PERMISSION, [ACTION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: GroupMemberPaginateV1Request,
    ): Promise<IPaginationResponse<GroupMemberV1Response>> {
        const result = await this.groupMemberV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: GroupMemberV1Response.MapEntities(result.items),
            },
            message: 'Group member pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [ACTION.VIEW])
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<IBasicResponse<GroupMemberDetailV1Response>> {
        const result = await this.groupMemberV1Service.findOneByIdWithRelations(id);

        return {
            data: GroupMemberDetailV1Response.FromEntity(result),
            message: 'Group member retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [ACTION.CREATE])
    @Post()
    async create(
        @Body() createDto: GroupMemberCreateV1Request,
    ): Promise<IBasicResponse<GroupMemberV1Response>> {
        const result = await this.groupMemberV1Service.create(createDto);

        return {
            data: GroupMemberV1Response.FromEntity(result),
            message: 'Group member created successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [ACTION.DELETE])
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<IBasicResponse<null>> {
        await this.groupMemberV1Service.delete(id);

        return {
            data: null,
            message: 'Group member removed successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [ACTION.DELETE])
    @Delete('groups/:groupId/users/:userId')
    async deleteByGroupAndUser(
        @Param('groupId') groupId: string,
        @Param('userId') userId: string,
    ): Promise<IBasicResponse<null>> {
        await this.groupMemberV1Service.deleteByGroupAndUser(groupId, userId);

        return {
            data: null,
            message: 'User removed from group successfully',
        };
    }
}