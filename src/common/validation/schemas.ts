import { z } from "zod";
import { validateRequest } from "#common/middleware/validate.js";

export const globalFiltersSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  country: z.string().optional(),
  productCategory: z.string().optional(),
  marketingChannel: z.string().optional(),
  customerSegment: z.string().optional(),
});

export const validateGlobalFilters = validateRequest({
  query: globalFiltersSchema,
});

export const paginatedGlobalFiltersSchema = globalFiltersSchema.extend({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});

export const validatePaginatedGlobalFilters = validateRequest({
  query: paginatedGlobalFiltersSchema,
});
