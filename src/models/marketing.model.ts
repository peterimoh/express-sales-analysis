import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { MarketingPerformance } from "#types/index.js";

export class MarketingModel extends BaseModel<MarketingPerformance> {
  protected tableName = "sales";

  async getMarketingPerformance(
    params: GlobalFiltersParams
  ): Promise<MarketingPerformance[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions (exclude country since we're grouping by it)
    const filters: string[] = [];
    const filterConditions: string[] = [];

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
      SELECT
        CONCAT(country, ' - ', COALESCE(region, 'Unknown')) AS location,
        SUM(total_amount)::numeric AS revenue,
        COUNT(*)::numeric AS orders
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND country IS NOT NULL
        ${whereClause}
      GROUP BY country, region
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<MarketingPerformance>(query, queryParams);
    return result.rows;
  }
}

export const marketingModel = new MarketingModel();
