import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const OrganizationCreateV1Schema = z.object({
    code: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Code'),
    }),
    name: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Name'),
    }),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export class OrganizationCreateV1Request extends ZodUtils.createCamelCaseDto(
    OrganizationCreateV1Schema,
) {}