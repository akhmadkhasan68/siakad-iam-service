import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RefreshTokenPaginateV1Schema = PaginateSchema.extend({
    userId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    isRevoked: z.boolean().optional(),
    isExpired: z.boolean().optional(),
});

export class RefreshTokenPaginateV1Request extends ZodUtils.createCamelCaseDto(
    RefreshTokenPaginateV1Schema,
) {}