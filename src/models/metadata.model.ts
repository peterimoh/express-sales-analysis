import { BaseModel } from "./base.model.js";
import type { TableMetadata } from "#types/index.js";

export class MetadataModel extends BaseModel<TableMetadata> {
  protected tableName = "sales";

  async getLastUpdateTime(): Promise<TableMetadata> {
    const query = `
      SELECT MAX(transaction_date) AS last_updated
      FROM ${this.tableName}
      WHERE transaction_date IS NOT NULL
    `;

    interface QueryResult {
      last_updated: Date | null;
    }

    const result = await this.query<QueryResult>(query);
    return {
      lastUpdated: result.rows[0]?.last_updated || null,
    };
  }
}

export const metadataModel = new MetadataModel();
