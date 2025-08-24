import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';
import {
    IAccessTokenResultData,
    IRefreshTokenResultData,
} from './token-result-data.interface';

export interface IAuthResultData {
    user: IUser;
    accessToken: IAccessTokenResultData;
    refreshToken: IRefreshTokenResultData;
}
