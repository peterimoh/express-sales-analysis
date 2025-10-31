import type { Request, Response, NextFunction } from "express";
import { filtersModel } from "#models/index.js";
import { AppError } from "#common/errors.js";
import RedisClient from "#config/redis.js";
import { CacheKeys } from "#config/cache-keys.js";

export const filtersController = {
  getFilters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cachedFilters = await RedisClient.get(CacheKeys.FILTERS_V1);
      if (cachedFilters) {
        res.json({ data: JSON.parse(cachedFilters) });
        return;
      }

      const filters = await filtersModel.getFilters();
      await RedisClient.set(CacheKeys.FILTERS_V1, JSON.stringify(filters));

      res.json({ data: filters });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get filters";
      next(new AppError(message, 500));
    }
  },
};
