import { BaseModel } from "./base.model.js";
import type { User, UserRole, CreateAdminInput } from "#types/index.js";
import bcrypt from "bcrypt";

export class UserModel extends BaseModel<User> {
  protected tableName = "users";

  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1 AND is_active = true`;
    const result = await this.query<User>(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 AND is_active = true`;
    const result = await this.query<User>(query, [id]);
    return result.rows[0] || null;
  }

  async createAdmin(input: CreateAdminInput): Promise<User> {
    const { email, password, fullName } = input;

    // Hash the default password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO ${this.tableName} (email, full_name, password_hash, role, is_password_reset_required)
      VALUES ($1, $2, $3, 'admin', true)
      RETURNING *
    `;

    const result = await this.query<User>(query, [
      email,
      fullName,
      password_hash,
    ]);
    return result.rows[0];
  }

  async updatePassword(userId: number, newPasswordHash: string): Promise<User> {
    const query = `
      UPDATE ${this.tableName}
      SET password_hash = $1, is_password_reset_required = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.query<User>(query, [newPasswordHash, userId]);
    return result.rows[0];
  }

  async updateLastLogin(userId: number): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.query(query, [userId]);
  }

  async verifyPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

export const userModel = new UserModel();
