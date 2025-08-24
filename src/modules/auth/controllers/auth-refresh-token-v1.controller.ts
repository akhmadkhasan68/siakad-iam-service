import { Controller, Post, UseGuards } from '@nestjs/common';
import { IRefreshToken } from 'src/infrastructures/databases/interfaces/refresh-token.interface';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { AuthV1Response } from '../dtos/responses/auth-v1.response';
import { AuthRefreshTokenV1Service } from '../services/auth-refresh-token-v1.service';
import { GetRefreshTokenLogged } from '../shared/decorators/get-refresh-token-logged.decorator';
import { ExcludeGlobalGuard } from '../shared/decorators/public.decorator';
import { JwtRefreshAuthGuard } from '../shared/guards/jwt-refresh-auth.guard';

@Controller({
    path: 'auth/refresh-token',
    version: '1',
})
@ExcludeGlobalGuard()
export class AuthRefreshTokenV1Controller {
    constructor(
        private readonly authRefreshTokenV1Service: AuthRefreshTokenV1Service,
    ) {}

    @UseGuards(JwtRefreshAuthGuard)
    @Post()
    async refreshToken(
        @GetRefreshTokenLogged() refreshToken: IRefreshToken,
    ): Promise<IBasicResponse<AuthV1Response>> {
        const result =
            await this.authRefreshTokenV1Service.refreshToken(refreshToken);

        return {
            message: 'Refresh token successful',
            data: AuthV1Response.MapEntity(result),
        };
    }
}
