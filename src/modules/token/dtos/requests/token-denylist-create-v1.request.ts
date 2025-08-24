import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const TokenDenylistCreateV1Schema = z.object({
    jti: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('JTI'),
    }),
    reason: z.string().optional(),
    expiresAt: z.date({
        required_error: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Expires At'),
    }),
});

export class TokenDenylistCreateV1Request extends ZodUtils.createCamelCaseDto(
    TokenDenylistCreateV1Schema,
) {}