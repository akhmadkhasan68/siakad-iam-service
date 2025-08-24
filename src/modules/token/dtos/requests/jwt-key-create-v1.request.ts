import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const JwtKeyCreateV1Schema = z.object({
    kid: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Kid'),
    }),
    alg: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Algorithm'),
    }),
    publicJwk: z.any().optional(),
    note: z.string().optional(),
    expiresAt: z.date().optional(),
});

export class JwtKeyCreateV1Request extends ZodUtils.createCamelCaseDto(
    JwtKeyCreateV1Schema,
) {}