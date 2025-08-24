import { Injectable } from '@nestjs/common';
import { IUser } from 'src/infrastructures/databases/interfaces/user.interface';

@Injectable()
export class AuthLogoutV1Service {
    constructor() {}

    async logout(user: IUser): Promise<void> {
        // TODO: implement logout logic
    }
}
