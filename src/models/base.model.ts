import pool from "#config/db.js";
import { QueryResult, QueryResultRow } from "pg";

/**
 * Base Model class that provides common database operations
 * All models should extend this class
 */
export abstract class BaseModel<T extends QueryResultRow> {
  protected abstract tableName: string;

  /**
   * Execute a raw SQL query
   */
  protected async query<R extends QueryResultRow = T>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<R>> {
    return pool.query<R>(text, params);
  }

  /**
   * Find a record by ID
   */
  async findById(id: number | string): Promise<T | null> {
    const result = await this.query<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all records with optional where clause
   */
  async findAll(where?: Record<string, unknown>): Promise<T[]> {
    if (!where || Object.keys(where).length === 0) {
      const result = await this.query<T>(`SELECT * FROM ${this.tableName}`);
      return result.rows;
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
    const result = await this.query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
    return result.rows;
  }

  /**
   * Find one record by conditions
   */
  async findOne(where: Record<string, unknown>): Promise<T | null> {
    const records = await this.findAll(where);
    return records[0] || null;
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const result = await this.query<T>(
      `INSERT INTO ${this.tableName} (${keys.join(
        ", "
      )}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update a record by ID
   */
  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

    const result = await this.query<T>(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number | string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Execute a custom query
   * Override this method or create custom methods in your model class
   */
  protected async customQuery<R extends QueryResultRow = T>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<R>> {
    return this.query<R>(text, params);
  }
}
