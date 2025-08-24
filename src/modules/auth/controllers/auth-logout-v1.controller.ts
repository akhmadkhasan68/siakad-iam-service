import { Controller, Delete } from '@nestjs/common';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { AuthLogoutV1Service } from '../services/auth-logout-v1.service';
import { GetUserLogged } from '../shared/decorators/get-user-logged.decorator';

@Controller({
    path: 'auth/logout',
    version: '1',
})
export class AuthLogoutV1Controller {
    constructor(private readonly authLogoutV1Service: AuthLogoutV1Service) {}

    @Delete()
    async logout(@GetUserLogged() user: IUser): Promise<IBasicResponse<null>> {
        await this.authLogoutV1Service.logout(user);

        return {
            message: 'Logout successful',
            data: null,
        };
    }
}
