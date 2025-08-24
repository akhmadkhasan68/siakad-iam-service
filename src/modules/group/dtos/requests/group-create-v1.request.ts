import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GroupCreateV1Schema = z.object({
    organization_id: z.string().uuid().optional(),
    code: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
});

export class GroupCreateV1Request extends ZodUtils.createCamelCaseDto(
    GroupCreateV1Schema,
) {}