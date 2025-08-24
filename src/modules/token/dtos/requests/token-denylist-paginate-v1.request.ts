import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const TokenDenylistPaginateV1Schema = PaginateSchema.extend({
    jti: z.string().optional(),
    reason: z.string().optional(),
    isExpired: z.boolean().optional(),
});

export class TokenDenylistPaginateV1Request extends ZodUtils.createCamelCaseDto(
    TokenDenylistPaginateV1Schema,
) {}