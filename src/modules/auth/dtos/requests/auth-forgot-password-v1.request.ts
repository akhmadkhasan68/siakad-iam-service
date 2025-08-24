import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const AuthForgotPasswordV1RequestSchema = z.object({
    email: z.string().email(),
    redirectUrl: z.string().url().optional(),
});
export class AuthForgotPasswordV1Request extends ZodUtils.createCamelCaseDto(
    AuthForgotPasswordV1RequestSchema,
) {}
