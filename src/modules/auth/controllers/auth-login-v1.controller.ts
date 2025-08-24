import { Body, Controller, Post } from '@nestjs/common';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { AuthLoginV1Request } from '../dtos/requests/auth-login-v1.request';
import { AuthV1Response } from '../dtos/responses/auth-v1.response';
import { AuthLoginV1Service } from '../services/auth-login-v1.service';
import { Public } from '../shared/decorators/public.decorator';

@Controller({
    path: 'auth/login',
    version: '1',
})
@Public()
export class AuthLoginV1Controller {
    constructor(private readonly authLoginv1Service: AuthLoginV1Service) {}

    @Post()
    async login(
        @Body() request: AuthLoginV1Request,
    ): Promise<IBasicResponse<AuthV1Response>> {
        const result = await this.authLoginv1Service.login(
            request.email,
            request.password,
        );

        return {
            message: 'Authentication successful',
            data: AuthV1Response.MapEntity(result),
        };
    }
}
