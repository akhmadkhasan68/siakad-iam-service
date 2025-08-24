import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const AuthForgotPasswordVerifyV1RequestSchema = z.object({
    token: z.string(),
});

export class AuthForgotPasswordVerifyV1Request extends ZodUtils.createCamelCaseDto(
    AuthForgotPasswordVerifyV1RequestSchema,
) {}
