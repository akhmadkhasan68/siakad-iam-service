import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ActionPaginateV1Schema = PaginateSchema.extend({
    code: z.string().optional(),
});

export class ActionPaginateV1Request extends ZodUtils.createCamelCaseDto(
    ActionPaginateV1Schema,
) {}
