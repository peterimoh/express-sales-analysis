import type { Request, Response, NextFunction } from "express";
import { satisfactionModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { validateGlobalFilters } from "#common/validation/schemas.js";

export const satisfactionController = {
  getSatisfaction: [
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
        const cacheKey = `satisfaction:category:${JSON.stringify(params)}`;
        const cachedSatisfaction = await RedisClient.get(cacheKey);

        if (cachedSatisfaction) {
          res.json({ data: JSON.parse(cachedSatisfaction) });
          return;
        }

        const satisfaction = await satisfactionModel.getSatisfaction(params);

        await RedisClient.set(cacheKey, JSON.stringify(satisfaction));
        res.json({ data: satisfaction });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get satisfaction data";
        next(new AppError(message, 500));
      }
    },
  ],
  getNPSDistribution: [
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
        const cacheKey = `satisfaction:nps:distribution:${JSON.stringify(
          params
        )}`;
        const cachedDistribution = await RedisClient.get(cacheKey);

        if (cachedDistribution) {
          res.json({ data: JSON.parse(cachedDistribution) });
          return;
        }

        const distribution = await satisfactionModel.getNPSDistribution(params);

        await RedisClient.set(cacheKey, JSON.stringify(distribution));
        res.json({ data: distribution });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get NPS distribution";
        next(new AppError(message, 500));
      }
    },
  ],
  getCSATDistribution: [
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
        const cacheKey = `satisfaction:csat:distribution:${JSON.stringify(
          params
        )}`;
        const cachedDistribution = await RedisClient.get(cacheKey);

        if (cachedDistribution) {
          res.json({ data: JSON.parse(cachedDistribution) });
          return;
        }

        const distribution = await satisfactionModel.getCSATDistribution(
          params
        );

        await RedisClient.set(cacheKey, JSON.stringify(distribution));
        res.json({ data: distribution });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get CSAT distribution";
        next(new AppError(message, 500));
      }
    },
  ],
};
