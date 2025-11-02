import { validatePaginatedGlobalFilters } from "#common/validation/schemas.js";
import type { Request, Response, NextFunction } from "express";
import { geographicModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import type { PaginatedResponse, GeographicPerformance } from "#types/index.js";

export const geographicController = {
  getRegionalPerformance: [
    validatePaginatedGlobalFilters,
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
          page,
          limit,
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
          page: (page as number) || 1,
          limit: (limit as number) || 20,
        };

        // Generate cache key with all parameters including pagination
        const cacheKey = `geographic:regional:${JSON.stringify(params)}`;
        const cachedData = await RedisClient.get(cacheKey);

        if (cachedData) {
          res.json(JSON.parse(cachedData));
          return;
        }

        const result = await geographicModel.getRegionalPerformance(params);
        const totalPages = Math.ceil(result.total / params.limit);

        const response: PaginatedResponse<GeographicPerformance> = {
          data: result.data,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: result.total,
            totalPages,
          },
        };

        await RedisClient.set(cacheKey, JSON.stringify(response));
        res.json(response);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get regional performance";
        next(new AppError(message, 500));
      }
    },
  ],
};
