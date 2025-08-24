import { Controller, Get } from '@nestjs/common';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { UserV1Response } from 'src/modules/user/dtos/responses/user-v1.response';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { GetUserLogged } from '../shared/decorators/get-user-logged.decorator';

@Controller({
    path: 'auth/me',
    version: '1',
})
export class AuthMeV1Controller {
    @Get()
    async me(
        @GetUserLogged() user: IUser,
    ): Promise<IBasicResponse<UserV1Response>> {
        return {
            message: 'User information retrieved successfully',
            data: UserV1Response.FromEntity(user),
        };
    }
}
