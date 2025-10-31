import type { Request, Response, NextFunction } from "express";
import { exampleModel } from "#models/index.js";
import { AppError } from "#common/errors.js";

export const exampleController = {
  /**
   * GET /api/v1/examples
   * Get all examples
   */
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Optional query parameters for filtering
      const where = req.query as Record<string, unknown>;
      const examples = await exampleModel.findAll(where);
      res.json({ data: examples });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/examples/:id
   * Get example by ID
   */
  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const example = await exampleModel.findById(id);

      if (!example) {
        throw new AppError("Example not found", 404);
      }

      res.json({ data: example });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/examples
   * Create a new example
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const example = await exampleModel.create(req.body);
      res.status(201).json({ data: example });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/examples/:id
   * Update an example
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const example = await exampleModel.update(id, req.body);

      if (!example) {
        throw new AppError("Example not found", 404);
      }

      res.json({ data: example });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/examples/:id
   * Delete an example
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await exampleModel.delete(id);

      if (!deleted) {
        throw new AppError("Example not found", 404);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
