import { BaseModel } from "./base.model.js";

export interface Filter {
  countries?: string[];
  categories?: string[];
  channels?: string[];
  segments?: string[];
}

interface QueryResult {
  facets: Filter;
}

export class FiltersModel extends BaseModel<Filter> {
  protected tableName = "sales";

  async getFilters(): Promise<Filter> {
    const query = `
      SELECT jsonb_build_object(
        'countries', (
          SELECT jsonb_agg(DISTINCT country ORDER BY country)
          FROM ${this.tableName}
          WHERE country IS NOT NULL
        ),
        'categories', (
          SELECT jsonb_agg(DISTINCT product_category ORDER BY product_category)
          FROM ${this.tableName}
          WHERE product_category IS NOT NULL
        ),
        'channels', (
          SELECT jsonb_agg(DISTINCT marketing_channel ORDER BY marketing_channel)
          FROM ${this.tableName}
          WHERE marketing_channel IS NOT NULL
        ),
        'segments', (
          SELECT jsonb_agg(DISTINCT customer_segment ORDER BY customer_segment)
          FROM ${this.tableName}
          WHERE customer_segment IS NOT NULL
        )
      ) AS facets
    `;

    const result = await this.query<QueryResult>(query);
    return result.rows[0].facets;
  }
}

export const filtersModel = new FiltersModel();
