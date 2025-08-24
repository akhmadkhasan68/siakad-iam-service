import { SetMetadata } from '@nestjs/common';
import type {
    TAction,
    TResource,
} from 'src/shared/constants/permission.constant';

export const PERMISSION_KEY = 'permission';

export const Permission = (group: TResource, actions: TAction[]) =>
    SetMetadata(PERMISSION_KEY, { group, actions });
