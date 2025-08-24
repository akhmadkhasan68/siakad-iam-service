import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GroupMemberPaginateV1Schema = PaginateSchema.extend({
    group_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
});

export class GroupMemberPaginateV1Request extends ZodUtils.createCamelCaseDto(
    GroupMemberPaginateV1Schema,
) {}