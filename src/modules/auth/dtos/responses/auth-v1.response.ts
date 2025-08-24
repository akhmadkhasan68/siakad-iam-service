import { IAuthResultData } from 'src/modules/auth/shared/interfaces/auth-result-data.interface';
import { UserV1Response } from '../../../user/dtos/responses/user-v1.response';
import {
    IAccessTokenResultData,
    IRefreshTokenResultData,
} from '../../shared/interfaces/token-result-data.interface';

export class AuthV1Response {
    user: UserV1Response;
    accessToken: IAccessTokenResultData;
    refreshToken: IRefreshTokenResultData;

    static MapEntity(entity: IAuthResultData): AuthV1Response {
        return {
            user: UserV1Response.FromEntity(entity.user),
            accessToken: entity.accessToken,
            refreshToken: entity.refreshToken,
        };
    }
}
