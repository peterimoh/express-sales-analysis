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
  getCohortRetention: [
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
        const cacheKey = `marketing:cohort-retention:${JSON.stringify(params)}`;
        const cachedRetention = await RedisClient.get(cacheKey);

        if (cachedRetention) {
          res.json({ data: JSON.parse(cachedRetention) });
          return;
        }

        const retention = await marketingModel.getCohortRetention(params);

        await RedisClient.set(cacheKey, JSON.stringify(retention));
        res.json({ data: retention });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get cohort retention";
        next(new AppError(message, 500));
      }
    },
  ],
  getProductAffinities: [
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
        const cacheKey = `marketing:product-affinities:${JSON.stringify(params)}`;
        const cachedAffinities = await RedisClient.get(cacheKey);

        if (cachedAffinities) {
          res.json({ data: JSON.parse(cachedAffinities) });
          return;
        }

        const affinities = await marketingModel.getProductAffinities(params);

        await RedisClient.set(cacheKey, JSON.stringify(affinities));
        res.json({ data: affinities });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get product affinities";
        next(new AppError(message, 500));
      }
    },
  ],
  getDiscountImpact: [
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
        const cacheKey = `marketing:discount-impact:${JSON.stringify(params)}`;
        const cachedImpact = await RedisClient.get(cacheKey);

        if (cachedImpact) {
          res.json({ data: JSON.parse(cachedImpact) });
          return;
        }

        const impact = await marketingModel.getDiscountImpact(params);

        await RedisClient.set(cacheKey, JSON.stringify(impact));
        res.json({ data: impact });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get discount impact";
        next(new AppError(message, 500));
      }
    },
  ],
};
