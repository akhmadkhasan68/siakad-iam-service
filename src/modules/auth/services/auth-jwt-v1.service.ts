import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { config } from 'src/config';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import { DateTimeUtil } from 'src/shared/utils/datetime.util';
import { IJwtPayload } from '../shared/interfaces/jwt-payload.interface';
import { IJwtRefreshPayload } from '../shared/interfaces/jwt-refresh-payload.interface';
import {
    IAccessTokenResultData,
    IRefreshTokenResultData,
} from '../shared/interfaces/token-result-data.interface';

@Injectable()
export class AuthJwtV1Service {
    constructor(private readonly jwtService: JwtService) {}

    private readonly JWT_ACCESS_TOKEN_SECRET = config.jwt.secret;
    private readonly JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS =
        config.jwt.expiresInSeconds;
    private readonly JWT_REFRESH_TOKEN_SECRET = config.jwt.refreshTokenSecret;
    private readonly JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS =
        config.jwt.refreshTokenExpiresInSeconds;

    /**
     * Generates a JWT token for the given user.
     * @param user The user object containing user information.
     * @returns A promise that resolves to the generated JWT token.
     */
    public async generateAccessToken(
        user: IUser,
    ): Promise<IAccessTokenResultData> {
        const dateNow = new Date();

        const payload: IJwtPayload = {
            id: user.id,
            fullName: user.fullName,
        };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: this.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
            secret: this.JWT_ACCESS_TOKEN_SECRET,
        });

        return {
            token,
            expiresIn: DateTimeUtil.addSeconds(
                dateNow,
                this.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
            ),
        };
    }

    /**
     *
     * @param user The user object containing user information.
     * @description Generates a refresh token for the given user.
     * @returns A promise that resolves to the generated refresh token.
     */
    public async generateRefreshToken(
        user: IUser,
    ): Promise<IRefreshTokenResultData> {
        const dateNow = new Date();
        const payload: IJwtRefreshPayload = {
            id: randomUUID(),
            userId: user.id,
        };

        // Generate a new refresh token
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
            secret: this.JWT_REFRESH_TOKEN_SECRET,
        });

        // Save the refresh token to the database
        await this.saveRefreshToken(user, token, payload.id);

        return {
            token,
            expiresIn: DateTimeUtil.addSeconds(
                dateNow,
                this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
            ),
        };
    }

    /**
     * Saves the refresh token to the database.
     * @param user The user object containing user information.
     * @param refreshToken The refresh token string.
     * @param refreshTokenUuid The UUID of the refresh token.
     */
    private async saveRefreshToken(
        user: IUser,
        refreshToken: string,
        refreshTokenUuid: string,
    ): Promise<void> {
        // const data = this.userTokenV1Repository.create({
        //     user,
        //     token: refreshToken,
        //     id: refreshTokenUuid,
        //     expiresAt: DateTimeUtil.addSeconds(
        //         new Date(),
        //         this.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
        //     ),
        //     type: UserTokenTypeEnum.RefreshToken,
        // });
        // // Save the refresh token to the database
        // await this.userTokenV1Repository.save(data);
    }
}
