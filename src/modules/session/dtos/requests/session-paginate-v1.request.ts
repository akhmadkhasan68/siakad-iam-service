import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SessionPaginateV1Schema = PaginateSchema.extend({
    userId: z.string().uuid().optional(),
    isRevoked: z.boolean().optional(),
});

export class SessionPaginateV1Request extends ZodUtils.createCamelCaseDto(
    SessionPaginateV1Schema,
) {}