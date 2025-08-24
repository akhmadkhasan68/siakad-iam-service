import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';

export interface IUserEmail extends IBaseEntity {
    userId: string;
    email: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt?: Date;
    user?: IUser;
}