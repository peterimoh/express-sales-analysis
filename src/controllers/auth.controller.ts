import type { Request, Response, NextFunction } from "express";
import { AppError } from "#common/errors.js";
import { userModel } from "#models/user.model.js";
import { generateToken } from "#config/jwt.js";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const createAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

const resetPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(validationResult.error.issues[0].message, 400);
      }

      const { email, password } = validationResult.data;

      // Find user by email
      const user = await userModel.findByEmail(email);
      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      // Verify password
      const isPasswordValid = await userModel.verifyPassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
      }

      // Update last login
      await userModel.updateLastLogin(user.id);

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_password_reset_required: user.is_password_reset_required,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      next(
        new AppError(message, error instanceof AppError ? error.status : 500)
      );
    }
  },

  createAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validationResult = createAdminSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(validationResult.error.issues[0].message, 400);
      }

      const { email, password, fullName } = validationResult.data;

      // Check if email already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        throw new AppError("Email already exists", 409);
      }

      // Create admin with default password (password reset required)
      const newAdmin = await userModel.createAdmin({
        email,
        password, // This is the default password set by super admin
        fullName,
      });

      res.status(201).json({
        data: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role,
          is_password_reset_required: newAdmin.is_password_reset_required,
          created_at: newAdmin.created_at,
        },
        message:
          "Admin created successfully. They must reset their password on first login.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create admin";
      next(
        new AppError(message, error instanceof AppError ? error.status : 500)
      );
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      // Validate request body
      const validationResult = resetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(validationResult.error.issues[0].message, 400);
      }

      const { currentPassword, newPassword } = validationResult.data;

      // Get current user
      const user = await userModel.findById(req.user.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Verify current password
      const isPasswordValid = await userModel.verifyPassword(
        currentPassword,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new AppError("Current password is incorrect", 401);
      }

      // Hash new password
      const newPasswordHash = await userModel.hashPassword(newPassword);

      // Update password and remove password reset requirement
      await userModel.updatePassword(user.id, newPasswordHash);

      res.json({
        message: "Password reset successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      next(
        new AppError(message, error instanceof AppError ? error.status : 500)
      );
    }
  },

  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const user = await userModel.findById(req.user.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.json({
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_password_reset_required: user.is_password_reset_required,
          last_login: user.last_login,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get profile";
      next(
        new AppError(message, error instanceof AppError ? error.status : 500)
      );
    }
  },

  getAllAdmins: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await userModel.getAllAdmins();

      res.json({
        data: admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role,
          is_password_reset_required: admin.is_password_reset_required,
          is_active: admin.is_active,
          last_login: admin.last_login,
          created_at: admin.created_at,
          updated_at: admin.updated_at,
        })),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get admins";
      next(
        new AppError(message, error instanceof AppError ? error.status : 500)
      );
    }
  },
};
