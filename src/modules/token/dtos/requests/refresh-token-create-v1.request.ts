import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RefreshTokenCreateV1Schema = z.object({
    userId: z.string().uuid({
        message: ERROR_MESSAGE_CONSTANT.FieldInvalidValueWithName('User ID', 'UUID'),
    }),
    sessionId: z.string().uuid({
        message: ERROR_MESSAGE_CONSTANT.FieldInvalidValueWithName('Session ID', 'UUID'),
    }),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    expiresAt: z.date({
        required_error: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Expires At'),
    }),
});

export class RefreshTokenCreateV1Request extends ZodUtils.createCamelCaseDto(
    RefreshTokenCreateV1Schema,
) {}