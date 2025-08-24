import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ResourceUpdateV1Schema = z.object({
    code: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Code'),
    }).optional(),
    name: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Name'),
    }).optional(),
    isActive: z.boolean().optional(),
});

export class ResourceUpdateV1Request extends ZodUtils.createCamelCaseDto(
    ResourceUpdateV1Schema,
) {}