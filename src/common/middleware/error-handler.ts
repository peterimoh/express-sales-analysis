import { AppError } from "#common/errors.js";
import { Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
