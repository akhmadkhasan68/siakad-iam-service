import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const JwtKeyUpdateV1Schema = z.object({
    alg: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Algorithm'),
    }).optional(),
    publicJwk: z.any().optional(),
    note: z.string().optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.date().optional(),
});

export class JwtKeyUpdateV1Request extends ZodUtils.createCamelCaseDto(
    JwtKeyUpdateV1Schema,
) {}