import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const OrganizationPaginateV1Schema = PaginateSchema.extend({
    code: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class OrganizationPaginateV1Request extends ZodUtils.createCamelCaseDto(
    OrganizationPaginateV1Schema,
) {}