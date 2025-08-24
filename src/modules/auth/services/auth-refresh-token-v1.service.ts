import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IRefreshToken } from 'src/infrastructures/databases/interfaces/refresh-token.interface';
import { IAuthResultData } from '../shared/interfaces/auth-result-data.interface';
import { AuthJwtV1Service } from './auth-jwt-v1.service';

@Injectable()
export class AuthRefreshTokenV1Service {
    constructor(private readonly authJwtV1Service: AuthJwtV1Service) {}

    /**
     * Refreshes the JWT token using the provided refresh token.
     * @param refreshToken The refresh token object containing the token and user information.
     * @returns A promise that resolves to the new JWT token and refresh token.
     * @throws UnauthorizedException if the refresh token is expired or invalid.
     */
    async refreshToken(refreshToken: IRefreshToken): Promise<IAuthResultData> {
        // Check if the refresh token is expired
        const isExpired = refreshToken.expiresAt < new Date();
        if (isExpired) {
            throw new UnauthorizedException('Refresh token expired');
        }

        if (!refreshToken.user) {
            throw new UnauthorizedException('User not found');
        }

        // Generate a new JWT token
        const accessToken = await this.authJwtV1Service.generateAccessToken(
            refreshToken.user,
        );

        return {
            user: refreshToken.user,
            accessToken,
            refreshToken: {
                token: refreshToken.token,
                expiresIn: refreshToken.expiresAt,
            },
        };
    }
}
