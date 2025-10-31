import type { Request, Response, NextFunction } from "express";
import { customerModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { validateGlobalFilters } from "#common/validation/schemas.js";

export const customersController = {
  getCLVDistribution: [
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
        const cacheKey = `customer:clv:distribution:${JSON.stringify(params)}`;
        const cachedDistribution = await RedisClient.get(cacheKey);

        if (cachedDistribution) {
          res.json({ data: JSON.parse(cachedDistribution) });
          return;
        }

        const distribution = await customerModel.getCustomerLifetimeValue(
          params
        );

        await RedisClient.set(cacheKey, JSON.stringify(distribution));
        res.json({ data: distribution });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get CLV distribution";
        next(new AppError(message, 500));
      }
    },
  ],
};
