import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RefreshTokenUpdateV1Schema = z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    expiresAt: z.date().optional(),
});

export class RefreshTokenUpdateV1Request extends ZodUtils.createCamelCaseDto(
    RefreshTokenUpdateV1Schema,
) {}