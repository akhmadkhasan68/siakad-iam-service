import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const TokenDenylistUpdateV1Schema = z.object({
    reason: z.string().optional(),
    expiresAt: z.date().optional(),
});

export class TokenDenylistUpdateV1Request extends ZodUtils.createCamelCaseDto(
    TokenDenylistUpdateV1Schema,
) {}