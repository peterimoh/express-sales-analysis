import { GlobalFiltersParams, CLVDistribution } from "#types/index.js";
import { BaseModel } from "./base.model.js";

export class CustomerModel extends BaseModel<CLVDistribution> {
  protected tableName = "sales";

  async getCustomerLifetimeValue(
    params: GlobalFiltersParams
  ): Promise<CLVDistribution[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions
    const filters: string[] = [];
    const filterConditions: string[] = [];

    if (country) {
      filters.push(`country = $${filterConditions.length + 3}`);
      filterConditions.push(country);
    }
    if (productCategory) {
      filters.push(`product_category = $${filterConditions.length + 3}`);
      filterConditions.push(productCategory);
    }
    if (marketingChannel) {
      filters.push(`marketing_channel = $${filterConditions.length + 3}`);
      filterConditions.push(marketingChannel);
    }
    if (customerSegment) {
      filters.push(`customer_segment = $${filterConditions.length + 3}`);
      filterConditions.push(customerSegment);
    }

    const whereClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      WITH unique_customers AS (
        SELECT DISTINCT
          customer_id,
          customer_lifetime_value
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND customer_id IS NOT NULL
          AND customer_lifetime_value IS NOT NULL
          ${whereClause}
      ),
      clv_bins AS (
        SELECT
          CASE
            WHEN customer_lifetime_value < 500 THEN '$0-500'
            WHEN customer_lifetime_value < 1000 THEN '$500-1K'
            WHEN customer_lifetime_value < 2000 THEN '$1K-2K'
            WHEN customer_lifetime_value < 3000 THEN '$2K-3K'
            ELSE '$3K+'
          END AS range,
          CASE
            WHEN customer_lifetime_value < 500 THEN 1
            WHEN customer_lifetime_value < 1000 THEN 2
            WHEN customer_lifetime_value < 2000 THEN 3
            WHEN customer_lifetime_value < 3000 THEN 4
            ELSE 5
          END AS sort_order
        FROM unique_customers
      )
      SELECT
        range,
        COUNT(*)::numeric AS count
      FROM clv_bins
      GROUP BY range, sort_order
      ORDER BY sort_order
    `;

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<CLVDistribution>(query, queryParams);

    // Ensure all bins are present (in case some ranges have 0 count)
    const binRanges = ["$0-500", "$500-1K", "$1K-2K", "$2K-3K", "$3K+"];
    const resultMap = new Map(result.rows.map((row) => [row.range, row.count]));

    return binRanges.map((range) => ({
      range,
      count: resultMap.get(range) || 0,
    }));
  }
}

export const customerModel = new CustomerModel();
