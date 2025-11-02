import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { GeographicPerformance } from "#types/index.js";

interface GeographicParams extends GlobalFiltersParams {
  page?: number;
  limit?: number;
}

export class GeographicModel extends BaseModel<GeographicPerformance> {
  protected tableName = "sales";

  async getRegionalPerformance(
    params: GeographicParams
  ): Promise<{ data: GeographicPerformance[]; total: number }> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
      page = 1,
      limit = 20,
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

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Query for total count - must match main query grouping exactly
    const countQuery = `
      SELECT COUNT(*)::integer AS total
      FROM (
        SELECT 
          country,
          COALESCE(region, 'Unknown') AS region
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND country IS NOT NULL
          ${whereClause}
        GROUP BY country, region
      ) AS region_groups
    `;

    // Main query with pagination
    const query = `
      SELECT
        country,
        COALESCE(region, 'Unknown') AS region,
        COUNT(*)::integer AS orders,
        SUM(total_amount)::numeric AS revenue,
        SUM(total_profit)::numeric AS profit,
        CASE
          WHEN SUM(total_amount) > 0 THEN 
            ROUND((SUM(total_profit) / NULLIF(SUM(total_amount), 0)) * 100, 2)
          ELSE 0
        END AS margin,
        COUNT(DISTINCT customer_id)::integer AS customers_count
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND country IS NOT NULL
        ${whereClause}
      GROUP BY country, region
      ORDER BY revenue DESC
      LIMIT $${filterConditions.length + 3} OFFSET $${
      filterConditions.length + 4
    }
    `;

    interface QueryResult {
      country: string;
      region: string;
      orders: number;
      revenue: number;
      profit: number;
      margin: number;
      customers_count: number;
    }

    interface CountResult {
      total: number;
    }

    const queryParams = [
      startDate,
      endDate,
      ...filterConditions,
      limit,
      offset,
    ];
    const countParams = [startDate, endDate, ...filterConditions];

    const [result, countResult] = await Promise.all([
      this.query<QueryResult>(query, queryParams),
      this.query<CountResult>(countQuery, countParams),
    ]);

    // Ensure total is a number
    const totalValue = countResult.rows[0]?.total;
    const total =
      typeof totalValue === "number"
        ? totalValue
        : parseInt(String(totalValue || 0), 10);

    const data = result.rows.map((row) => {
      // Ensure all numeric values are properly converted
      const ordersValue =
        typeof row.orders === "number"
          ? row.orders
          : parseInt(String(row.orders || 0), 10);

      const revenueValue =
        typeof row.revenue === "number"
          ? row.revenue
          : parseFloat(String(row.revenue || 0));

      const profitValue =
        typeof row.profit === "number"
          ? row.profit
          : parseFloat(String(row.profit || 0));

      const marginValue =
        typeof row.margin === "number"
          ? row.margin
          : parseFloat(String(row.margin || 0));

      const customersCountValue =
        typeof row.customers_count === "number"
          ? row.customers_count
          : parseInt(String(row.customers_count || 0), 10);

      return {
        country: row.country,
        region: row.region,
        orders: ordersValue,
        revenue: revenueValue,
        profit: profitValue,
        margin: marginValue.toFixed(2),
        customersCount: customersCountValue,
      };
    });

    return { data, total };
  }
}

export const geographicModel = new GeographicModel();
