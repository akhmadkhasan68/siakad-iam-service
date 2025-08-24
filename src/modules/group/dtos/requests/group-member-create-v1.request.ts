import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GroupMemberCreateV1Schema = z.object({
    group_id: z.string().uuid(),
    user_id: z.string().uuid(),
});

export class GroupMemberCreateV1Request extends ZodUtils.createCamelCaseDto(
    GroupMemberCreateV1Schema,
) {}