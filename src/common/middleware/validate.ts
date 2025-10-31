import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import type { ZodError, ZodType } from "zod";

// Extend Express Request type to include validated properties
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
      validatedParams?: ParamsDictionary;
    }
  }
}

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      (error as any).message = result.error;
      return next(error);
    }
    req.body = result.data;
    next();
  };

export class ValidationError extends Error {
  public zodError: ZodError;
  public statusCode = 400;

  constructor(zodError: ZodError) {
    super("Validation failed");
    this.name = "ValidationError";
    this.zodError = zodError;
  }
}

export const validateDetailed =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError(result.error));
    }
    req.body = result.data;
    next();
  };

export const validateRequest =
  (schemas: { body?: ZodType; query?: ZodType; params?: ZodType }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          return next(new ValidationError(bodyResult.error));
        }
        req.body = bodyResult.data;
      }

      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          return next(new ValidationError(queryResult.error));
        }
        // Store validated query in a custom property since req.query is read-only
        req.validatedQuery = queryResult.data as Record<string, unknown>;
      }

      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          return next(new ValidationError(paramsResult.error));
        }
        // Store validated params in a custom property
        req.validatedParams = paramsResult.data as ParamsDictionary;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const handleValidationError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ValidationError || error.name === "ValidationError") {
    const zodError =
      error instanceof ValidationError
        ? error.zodError
        : (error as any).zodError || (error as any).message;

    return res.status(400).json({
      error: "Validation failed",
      details: zodError?.issues || zodError || "Invalid input",
    });
  }
  next(error);
};
