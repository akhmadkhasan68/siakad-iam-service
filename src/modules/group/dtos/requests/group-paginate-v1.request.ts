import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GroupPaginateV1Schema = PaginateSchema.extend({
    organization_id: z.string().uuid().optional(),
    code: z.string().optional(),
});

export class GroupPaginateV1Request extends ZodUtils.createCamelCaseDto(
    GroupPaginateV1Schema,
) {}