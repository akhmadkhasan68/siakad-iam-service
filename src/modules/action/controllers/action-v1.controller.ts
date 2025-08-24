import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/auth/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/auth/shared/enums/token-type.enum';
import { ACTION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { ActionPaginateV1Request } from '../dtos/requests/action-paginate-v1.request';
import { ActionV1Response } from '../dtos/responses/action-v1.response';
import { ActionV1Service } from '../services/action-v1.service';

@Controller({
    path: 'actions',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class ActionV1Controller {
    constructor(private readonly actionV1Service: ActionV1Service) {}

    @Permission(RESOURCE.PERMISSION, [ACTION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: ActionPaginateV1Request,
    ): Promise<IPaginationResponse<ActionV1Response>> {
        const result = await this.actionV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: ActionV1Response.MapEntities(result.items),
            },

            message: 'Action pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [ACTION.VIEW])
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<IBasicResponse<ActionV1Response>> {
        const result = await this.actionV1Service.findOneById(id);

        return {
            data: ActionV1Response.FromEntity(result),
            message: 'Action retrieved successfully',
        };
    }
}
