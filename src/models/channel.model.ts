import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { ChannelMix, ChannelPerformance } from "#types/index.js";

export class ChannelModel extends BaseModel<ChannelPerformance> {
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

  async getChannelPerformance(
    params: GlobalFiltersParams
  ): Promise<ChannelPerformance[]> {
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
      WITH channel_stats AS (
        SELECT
          marketing_channel AS channel,
          COUNT(*)::numeric AS orders,
          SUM(total_amount)::numeric AS revenue,
          SUM(total_profit)::numeric AS profit,
          SUM(CASE WHEN cart_abandonment = 'Yes' THEN 1 ELSE 0 END)::numeric AS abandonment,
          ROUND(SUM(total_amount) / NULLIF(COUNT(*), 0), 2) AS aov,
          ROUND((SUM(total_profit) / NULLIF(SUM(total_amount), 0)) * 100, 2) AS profit_margin
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND marketing_channel IS NOT NULL
          ${whereClause}
        GROUP BY marketing_channel
      ),
      total_revenue AS (
        SELECT SUM(revenue) AS total FROM channel_stats
      )
      SELECT
        cs.channel,
        cs.orders,
        cs.revenue,
        cs.profit,
        cs.aov,
        cs.profit_margin,
        CASE
          WHEN tr.total > 0 THEN ROUND((cs.revenue / tr.total) * 100, 2)
          ELSE 0
        END AS revenue_share,
        cs.abandonment,
        CASE
          WHEN cs.orders > 0 THEN ROUND((cs.abandonment / cs.orders) * 100, 2)
          ELSE 0
        END AS abandonment_rate
      FROM channel_stats cs, total_revenue tr
      ORDER BY cs.revenue DESC
    `;

    interface QueryResult {
      channel: string;
      orders: number;
      revenue: number;
      profit: number;
      aov: number;
      profit_margin: number;
      revenue_share: number;
      abandonment: number;
      abandonment_rate: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure numeric values are converted properly
      const profitMarginValue =
        typeof row.profit_margin === "number"
          ? row.profit_margin
          : parseFloat(String(row.profit_margin)) || 0;

      const revenueShareValue =
        typeof row.revenue_share === "number"
          ? row.revenue_share
          : parseFloat(String(row.revenue_share)) || 0;

      const abandonmentRateValue =
        typeof row.abandonment_rate === "number"
          ? row.abandonment_rate
          : parseFloat(String(row.abandonment_rate)) || 0;

      return {
        channel: row.channel,
        orders: row.orders,
        revenue: row.revenue,
        profit: row.profit,
        aov: row.aov,
        profitMargin: profitMarginValue.toFixed(2),
        revenueShare: revenueShareValue.toFixed(2),
        abandonment: row.abandonment,
        abandonmentRate: abandonmentRateValue.toFixed(2),
      };
    });
  }
}

export const channelModel = new ChannelModel();
