import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserCredentialPasswordV1Repository } from 'src/modules/user/repositories/user-credential-password-v1.repository';
import { UserV1Repository } from 'src/modules/user/repositories/user-v1.repository';
import { HashUtil } from 'src/shared/utils/hash.util';
import { IAuthResultData } from '../shared/interfaces/auth-result-data.interface';
import { AuthJwtV1Service } from './auth-jwt-v1.service';

@Injectable()
export class AuthLoginV1Service {
    constructor(
        private readonly authJwtV1Service: AuthJwtV1Service,
        private readonly userV1Repository: UserV1Repository,
        private readonly userCredentialPasswordV1Repository: UserCredentialPasswordV1Repository,
    ) {}

    /**
     * Generates a JWT token for the given user.
     * @param user The user object containing user information.
     * @returns A promise that resolves to the generated JWT token.
     */
    async login(email: string, password: string): Promise<IAuthResultData> {
        // Find the user by email or phone number
        const user = await this.userV1Repository.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Find User Password
        const userCredentialPassword =
            await this.userCredentialPasswordV1Repository.findOneByUserIdOrFail(
                user.id,
            );

        // Check if the password is correct
        const isPasswordValid = await HashUtil.comparePassword(
            password,
            userCredentialPassword.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.authJwtV1Service.generateAccessToken(user),
            this.authJwtV1Service.generateRefreshToken(user),
        ]);

        return {
            user,
            accessToken,
            refreshToken,
        };
    }
}
