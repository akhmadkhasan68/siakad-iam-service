import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';

export interface IUserCredentialPassword extends IBaseEntity {
    userId: string;
    password: string;
    user?: IUser;
}
