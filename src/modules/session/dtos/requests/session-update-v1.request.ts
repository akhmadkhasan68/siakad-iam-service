import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SessionUpdateV1Schema = z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    lastSeenAt: z.date().optional(),
});

export class SessionUpdateV1Request extends ZodUtils.createCamelCaseDto(
    SessionUpdateV1Schema,
) {}