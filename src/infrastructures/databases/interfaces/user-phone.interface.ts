import { IBaseEntity } from './base-entity.interface';
import { IUser } from './user.interface';

export interface IUserPhone extends IBaseEntity {
    userId: string;
    phoneE164: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt?: Date;
    user?: IUser;
}