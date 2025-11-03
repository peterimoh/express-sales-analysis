import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { SegmentPerformance } from "#types/index.js";

export class SegmentModel extends BaseModel<SegmentPerformance> {
  protected tableName = "sales";

  async getSegmentPerformance(
    params: GlobalFiltersParams
  ): Promise<SegmentPerformance[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions (exclude customer_segment since we're grouping by it)
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

    const whereClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT
        customer_segment AS segment,
        COUNT(DISTINCT customer_id)::integer AS customers_count,
        COUNT(*)::numeric AS orders,
        SUM(total_amount)::numeric AS revenue,
        AVG(customer_lifetime_value)::numeric AS avg_clv,
        CASE
          WHEN SUM(total_amount) > 0 THEN 
            ROUND((SUM(total_profit) / NULLIF(SUM(total_amount), 0)) * 100, 2)
          ELSE 0
        END AS margin
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND customer_segment IS NOT NULL
        ${whereClause}
      GROUP BY customer_segment
      ORDER BY revenue DESC
    `;

    interface QueryResult {
      segment: string;
      customers_count: number;
      orders: number;
      revenue: number;
      avg_clv: number;
      margin: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure numeric values are properly converted
      const customersCountValue =
        typeof row.customers_count === "number"
          ? row.customers_count
          : parseInt(String(row.customers_count || 0), 10);

      const ordersValue =
        typeof row.orders === "number"
          ? row.orders
          : parseInt(String(row.orders || 0), 10);

      const revenueValue =
        typeof row.revenue === "number"
          ? row.revenue
          : parseFloat(String(row.revenue || 0));

      const avgCLVValue =
        typeof row.avg_clv === "number"
          ? row.avg_clv
          : parseFloat(String(row.avg_clv || 0));

      const marginValue =
        typeof row.margin === "number"
          ? row.margin
          : parseFloat(String(row.margin || 0));

      return {
        segment: row.segment,
        customersCount: customersCountValue,
        orders: ordersValue,
        revenue: revenueValue,
        avgCLV: avgCLVValue.toFixed(2),
        margin: marginValue.toFixed(2),
      };
    });
  }
}

export const segmentModel = new SegmentModel();
