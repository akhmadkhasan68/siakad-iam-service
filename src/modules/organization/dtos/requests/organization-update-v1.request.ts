import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const OrganizationUpdateV1Schema = z.object({
    code: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Code'),
    }).optional(),
    name: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Name'),
    }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class OrganizationUpdateV1Request extends ZodUtils.createCamelCaseDto(
    OrganizationUpdateV1Schema,
) {}