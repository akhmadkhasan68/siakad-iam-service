import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const JwtKeyPaginateV1Schema = PaginateSchema.extend({
    kid: z.string().optional(),
    alg: z.string().optional(),
    isActive: z.boolean().optional(),
});

export class JwtKeyPaginateV1Request extends ZodUtils.createCamelCaseDto(
    JwtKeyPaginateV1Schema,
) {}