import { BaseModel } from "./base.model.js";

/**
 * Example model demonstrating how to extend BaseModel
 * Replace with your actual entity/model
 */

// Define your entity type
export interface Example {
  id: number;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ExampleModel extends BaseModel<Example> {
  protected tableName = "examples"; // Replace with your actual table name

  /**
   * Custom query example: Find by email
   */
  async findByEmail(email: string): Promise<Example | null> {
    const result = await this.query<Example>(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Custom query example: Find with pagination
   */
  async findWithPagination(
    limit: number = 10,
    offset: number = 0
  ): Promise<Example[]> {
    const result = await this.query<Example>(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Custom query example: Count records
   */
  async count(where?: Record<string, unknown>): Promise<number> {
    if (!where || Object.keys(where).length === 0) {
      const result = await this.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${this.tableName}`
      );
      return parseInt(result.rows[0].count, 10);
    }

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(where)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");
    const result = await this.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
    return parseInt(result.rows[0].count, 10);
  }
}

// Export a singleton instance (optional, you can also instantiate directly)
export const exampleModel = new ExampleModel();
