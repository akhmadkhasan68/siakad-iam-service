import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const AuthLoginV1RequestSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export class AuthLoginV1Request extends ZodUtils.createCamelCaseDto(
    AuthLoginV1RequestSchema,
) {}
