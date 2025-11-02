import type { Request, Response, NextFunction } from "express";
import { marketingModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { validateGlobalFilters } from "#common/validation/schemas.js";

export const marketingController = {
  getPerformance: [
    validateGlobalFilters,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
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
        const cacheKey = `marketing:performance:${JSON.stringify(params)}`;
        const cachedPerformance = await RedisClient.get(cacheKey);

        if (cachedPerformance) {
          res.json({ data: JSON.parse(cachedPerformance) });
          return;
        }

        const performance = await marketingModel.getMarketingPerformance(
          params
        );

        await RedisClient.set(cacheKey, JSON.stringify(performance));
        res.json({ data: performance });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get marketing performance";
        next(new AppError(message, 500));
      }
    },
  ],
};
