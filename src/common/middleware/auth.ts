import type { Request, Response, NextFunction } from "express";
import { AppError } from "#common/errors.js";
import { verifyToken } from "#config/jwt.js";
import type { UserRole } from "#types/index.js";
import { userModel } from "#models/user.model.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT token
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const payload = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid or expired token", 401));
    }
  }
}

/**
 * Middleware to authorize based on user role
 * @param allowedRoles - Array of roles that are allowed to access
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        403
      );
    }

    next();
  };
}

/**
 * Middleware to check if user needs to reset password
 */
export function checkPasswordResetRequired(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  // This will be checked in the controller after fetching user from DB
  // We just ensure the user is authenticated here
  next();
}
