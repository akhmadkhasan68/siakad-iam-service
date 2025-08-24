import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SessionCreateV1Schema = z.object({
    userId: z.string().uuid({
        message: ERROR_MESSAGE_CONSTANT.FieldInvalidValueWithName('User ID', 'UUID'),
    }),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
});

export class SessionCreateV1Request extends ZodUtils.createCamelCaseDto(
    SessionCreateV1Schema,
) {}