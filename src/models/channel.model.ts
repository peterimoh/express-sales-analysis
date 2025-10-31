import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { ChannelMix } from "#types/index.js";

export class ChannelModel extends BaseModel<ChannelMix> {
  protected tableName = "sales";

  async getChannelMix(params: GlobalFiltersParams): Promise<ChannelMix[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions (exclude marketingChannel since we're grouping by it)
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
    if (customerSegment) {
      filters.push(`customer_segment = $${filterConditions.length + 3}`);
      filterConditions.push(customerSegment);
    }

    const whereClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT
        marketing_channel AS channel,
        COUNT(*)::numeric AS orders,
        SUM(total_amount)::numeric AS revenue,
        SUM(total_profit)::numeric AS profit,
        SUM(CASE WHEN cart_abandonment = 'Yes' THEN 1 ELSE 0 END)::numeric AS abandonment,
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((SUM(CASE WHEN cart_abandonment = 'Yes' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2)
          ELSE 0
        END AS abandonment_rate
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND marketing_channel IS NOT NULL
        ${whereClause}
      GROUP BY marketing_channel
      ORDER BY revenue DESC
    `;

    interface QueryResult {
      channel: string;
      orders: number;
      revenue: number;
      profit: number;
      abandonment: number;
      abandonment_rate: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    // Convert abandonment_rate to string with 2 decimal places (to match mock function)
    return result.rows.map((row) => {
      // Ensure abandonment_rate is a number before calling toFixed
      const abandonmentRateValue =
        typeof row.abandonment_rate === "number"
          ? row.abandonment_rate
          : parseFloat(String(row.abandonment_rate)) || 0;

      return {
        channel: row.channel,
        orders: row.orders,
        revenue: row.revenue,
        profit: row.profit,
        abandonment: row.abandonment,
        abandonmentRate: abandonmentRateValue.toFixed(2),
      };
    });
  }
}

export const channelModel = new ChannelModel();
