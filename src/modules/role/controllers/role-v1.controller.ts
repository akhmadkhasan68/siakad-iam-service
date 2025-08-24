import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/auth/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/auth/shared/enums/token-type.enum';
import { RoleV1Service } from 'src/modules/role/services/role-v1.service';
import { ACTION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { RoleCreateV1Request } from '../dtos/requests/role-create-v1.request';
import { RolePaginateV1Request } from '../dtos/requests/role-paginate-v1.request';
import { RoleUpdateV1Request } from '../dtos/requests/role-update-v1.request';
import {
    RoleDetailV1Response,
    RoleV1Response,
} from '../dtos/responses/role-v1.response';

@Controller({
    path: 'roles',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class RoleV1Controller {
    constructor(private readonly roleV1Service: RoleV1Service) {}

    @Permission(RESOURCE.ROLE, [ACTION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: RolePaginateV1Request,
    ): Promise<IPaginationResponse<RoleV1Response>> {
        const result = await this.roleV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: RoleV1Response.MapEntities(result.items),
            },

            message: 'Role pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.ROLE, [ACTION.VIEW])
    @Get(':roleId')
    async getById(
        @Param('roleId') roleId: string,
    ): Promise<IBasicResponse<RoleDetailV1Response>> {
        const data = await this.roleV1Service.findOneById(roleId);

        return {
            data: RoleDetailV1Response.FromEntity(data),
            message: 'Role retrieved successfully',
        };
    }

    @Permission(RESOURCE.ROLE, [ACTION.CREATE])
    @Post()
    async create(
        @Body() dataCreateDto: RoleCreateV1Request,
    ): Promise<IBasicResponse<RoleDetailV1Response>> {
        const data = await this.roleV1Service.create(dataCreateDto);

        return {
            data: RoleDetailV1Response.FromEntity(data),
            message: 'Role created successfully',
        };
    }

    @Permission(RESOURCE.ROLE, [ACTION.UPDATE])
    @Patch(':roleId')
    async updateRoleByid(
        @Param('roleId') roleId: string,
        @Body() dataRole: RoleUpdateV1Request,
    ): Promise<IBasicResponse<RoleDetailV1Response>> {
        const data = await this.roleV1Service.updateById(roleId, dataRole);
        return {
            data: RoleDetailV1Response.FromEntity(data),
            message: 'Role updated successfully',
        };
    }

    @Permission(RESOURCE.ROLE, [ACTION.DELETE])
    @Delete(':roleId')
    async deleteRoleByid(
        @Param('roleId') roleId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.roleV1Service.softDeleteById(roleId);
        return {
            data: null,
            message: 'Role deleted successfully',
        };
    }
}
