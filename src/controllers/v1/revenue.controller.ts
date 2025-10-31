import type { Request, Response, NextFunction } from "express";
import { revenueModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { validateGlobalFilters } from "#common/validation/schemas.js";

export const revenueController = {
  getTrends: [
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
        const cacheKey = `revenue:trends:${JSON.stringify(params)}`;
        const cachedTrends = await RedisClient.get(cacheKey);

        if (cachedTrends) {
          res.json({ data: JSON.parse(cachedTrends) });
          return;
        }

        const trends = await revenueModel.getTrends(params);

        await RedisClient.set(cacheKey, JSON.stringify(trends));
        res.json({ data: trends });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get revenue trends";
        next(new AppError(message, 500));
      }
    },
  ],
  getCategories: [
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
        const cacheKey = `revenue:categories:${JSON.stringify(params)}`;
        const cachedCategories = await RedisClient.get(cacheKey);

        if (cachedCategories) {
          res.json({ data: JSON.parse(cachedCategories) });
          return;
        }

        const categories = await revenueModel.getCategories(params);

        await RedisClient.set(cacheKey, JSON.stringify(categories));
        res.json({ data: categories });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get top categories by revenue";
        next(new AppError(message, 500));
      }
    },
  ],
  getTopCustomers: [
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
        const cacheKey = `revenue:customers:${JSON.stringify(params)}`;
        const cachedCustomers = await RedisClient.get(cacheKey);

        if (cachedCustomers) {
          res.json({ data: JSON.parse(cachedCustomers) });
          return;
        }

        const customers = await revenueModel.getTopCustomersByRevenue(params);

        await RedisClient.set(cacheKey, JSON.stringify(customers));
        res.json({ data: customers });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get top customers by revenue";
        next(new AppError(message, 500));
      }
    },
  ],
};
