import type { Request, Response, NextFunction } from "express";
import { kpisModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { CacheKeys } from "#config/cache-keys.js";
import { validateRequest } from "#common/middleware/validate.js";
import { z } from "zod";

const kpisParamsSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  country: z.string().optional(),
  productCategory: z.string().optional(),
  marketingChannel: z.string().optional(),
  customerSegment: z.string().optional(),
});

const validateKPIsParams = validateRequest({
  query: kpisParamsSchema,
});

export const kpisController = {
  getKPIs: [
    validateKPIsParams,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Use validated query data if available, otherwise fall back to req.query
        const query = req.validatedQuery || req.query;
        const {
          startDate,
          endDate,
          country,
          productCategory,
          marketingChannel,
          customerSegment,
        } = query;

        if (!startDate || !endDate) {
          throw new AppError("startDate and endDate are required", 400);
        }

        const params = {
          startDate: startDate as string,
          endDate: endDate as string,
          country: country as string | undefined,
          productCategory: productCategory as string | undefined,
          marketingChannel: marketingChannel as string | undefined,
          customerSegment: customerSegment as string | undefined,
        };

        // Generate cache key with all parameters
        const cacheKey = `${CacheKeys.KPIS_V1}:${JSON.stringify(params)}`;
        const cachedKPIs = await RedisClient.get(cacheKey);

        if (cachedKPIs) {
          res.json({ data: JSON.parse(cachedKPIs) });
          return;
        }

        const kpis = await kpisModel.getKPIs(params);

        if (!kpis) {
          throw new AppError("No KPIs found for the given parameters", 404);
        }

        await RedisClient.set(cacheKey, JSON.stringify(kpis));
        res.json({ data: kpis });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get KPIs";
        next(new AppError(message, 500));
      }
    },
  ],
};
