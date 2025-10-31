import type { Request, Response, NextFunction } from "express";
import { metadataModel } from "#models/index.js";
import { AppError } from "#common/errors.js";

export const metadataController = {
  getLastUpdate: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const metadata = await metadataModel.getLastUpdateTime();
      res.json({ data: metadata });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get last update time";
      next(new AppError(message, 500));
    }
  },
};

