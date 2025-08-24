import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { AuthForgotPasswordResetV1Request } from '../dtos/requests/auth-forgot-password-reset-v1.request';
import { AuthForgotPasswordV1Request } from '../dtos/requests/auth-forgot-password-v1.request';
import { AuthForgotPasswordVerifyV1Request } from '../dtos/requests/auth-forgot-password-verify-v1.request';
import { AuthForgotPasswordV1Service } from '../services/auth-forgot-password-v1.service';
import { Public } from '../shared/decorators/public.decorator';

@Controller({
    path: 'auth/forgot-password',
    version: '1',
})
export class AuthForgotPasswordV1Controller {
    constructor(
        private readonly authForgotPasswordService: AuthForgotPasswordV1Service,
    ) {}

    @Public()
    @Post('request')
    @HttpCode(HttpStatus.OK)
    async request(
        @Body() request: AuthForgotPasswordV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.authForgotPasswordService.requestForgotPassword(
            request.email,
            request.redirectUrl,
        );

        return {
            message: 'Request for password reset was successful',
            data: null,
        };
    }

    @Public()
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(
        @Body() request: AuthForgotPasswordVerifyV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.authForgotPasswordService.verifyForgotPasswordToken(
            request.token,
        );

        return {
            message: 'Token verification was successful',
            data: null,
        };
    }

    @Public()
    @Post('reset')
    @HttpCode(HttpStatus.OK)
    async reset(
        @Body() request: AuthForgotPasswordResetV1Request,
    ): Promise<IBasicResponse<null>> {
        await this.authForgotPasswordService.resetPassword(
            request.token,
            request.password,
        );

        return {
            message: 'Password reset was successful',
            data: null,
        };
    }
}
