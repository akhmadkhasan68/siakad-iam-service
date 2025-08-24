import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GroupUpdateV1Schema = z.object({
    organization_id: z.string().uuid().optional(),
    code: z.string().min(1).max(255).optional(),
    name: z.string().min(1).max(255).optional(),
});

export class GroupUpdateV1Request extends ZodUtils.createCamelCaseDto(
    GroupUpdateV1Schema,
) {}