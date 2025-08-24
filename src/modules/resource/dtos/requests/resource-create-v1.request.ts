import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ResourceCreateV1Schema = z.object({
    code: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Code'),
    }),
    name: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Name'),
    }),
    isActive: z.boolean().optional().default(true),
});

export class ResourceCreateV1Request extends ZodUtils.createCamelCaseDto(
    ResourceCreateV1Schema,
) {}