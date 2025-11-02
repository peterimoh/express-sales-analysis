import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type {
  Satisfaction,
  NPSDistribution,
  CSATDistribution,
} from "#types/index.js";

export class SatisfactionModel extends BaseModel<Satisfaction> {
  protected tableName = "sales";

  async getSatisfaction(params: GlobalFiltersParams): Promise<Satisfaction[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions (exclude productCategory since we're grouping by it)
    const filters: string[] = [];
    const filterConditions: string[] = [];

    if (country) {
      filters.push(`country = $${filterConditions.length + 3}`);
      filterConditions.push(country);
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
        product_category AS category,
        AVG(NULLIF(net_promoter_score, NULL)) AS avg_nps,
        AVG(NULLIF(customer_satisfaction_score, NULL)) AS avg_csat,
        SUM(total_amount)::numeric AS revenue
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND product_category IS NOT NULL
        ${whereClause}
      GROUP BY product_category
      HAVING 
        AVG(NULLIF(net_promoter_score, NULL)) IS NOT NULL
        OR AVG(NULLIF(customer_satisfaction_score, NULL)) IS NOT NULL
      ORDER BY revenue DESC
    `;

    interface QueryResult {
      category: string;
      avg_nps: number | null;
      avg_csat: number | null;
      revenue: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure numeric values are properly converted
      const revenueValue =
        typeof row.revenue === "number"
          ? row.revenue
          : parseFloat(String(row.revenue || 0));

      const avgNPSValue =
        row.avg_nps !== null && row.avg_nps !== undefined
          ? typeof row.avg_nps === "number"
            ? row.avg_nps
            : parseFloat(String(row.avg_nps)) || 0
          : 0;

      const avgCSATValue =
        row.avg_csat !== null && row.avg_csat !== undefined
          ? typeof row.avg_csat === "number"
            ? row.avg_csat
            : parseFloat(String(row.avg_csat)) || 0
          : 0;

      return {
        category: row.category,
        avgNPS: avgNPSValue.toFixed(1),
        avgCSAT: avgCSATValue.toFixed(1),
        revenue: revenueValue,
      };
    });
  }

  async getNPSDistribution(
    params: GlobalFiltersParams
  ): Promise<NPSDistribution[]> {
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
      WITH nps_bins AS (
        SELECT
          CASE
            WHEN net_promoter_score <= 6 THEN 'Detractors (0-6)'
            WHEN net_promoter_score <= 8 THEN 'Passives (7-8)'
            WHEN net_promoter_score <= 10 THEN 'Promoters (9-10)'
          END AS range,
          CASE
            WHEN net_promoter_score <= 6 THEN 1
            WHEN net_promoter_score <= 8 THEN 2
            WHEN net_promoter_score <= 10 THEN 3
          END AS sort_order
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND net_promoter_score IS NOT NULL
          ${whereClause}
      )
      SELECT
        range,
        COUNT(*)::integer AS count
      FROM nps_bins
      WHERE range IS NOT NULL
      GROUP BY range, sort_order
      ORDER BY sort_order
    `;

    interface QueryResult {
      range: string;
      count: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    // Ensure all bins are present, even if count is zero
    const binRanges = [
      "Detractors (0-6)",
      "Passives (7-8)",
      "Promoters (9-10)",
    ];
    const resultMap = new Map(result.rows.map((row) => [row.range, row.count]));

    return binRanges.map((range, index) => ({
      range,
      count:
        typeof resultMap.get(range) === "number"
          ? resultMap.get(range)!
          : parseInt(String(resultMap.get(range) || 0), 10),
    }));
  }

  async getCSATDistribution(
    params: GlobalFiltersParams
  ): Promise<CSATDistribution[]> {
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
      WITH csat_bins AS (
        SELECT
          CASE
            WHEN customer_satisfaction_score <= 3 THEN '1-3'
            WHEN customer_satisfaction_score <= 6 THEN '4-6'
            WHEN customer_satisfaction_score <= 8 THEN '7-8'
            WHEN customer_satisfaction_score <= 10 THEN '9-10'
          END AS range,
          CASE
            WHEN customer_satisfaction_score <= 3 THEN 1
            WHEN customer_satisfaction_score <= 6 THEN 2
            WHEN customer_satisfaction_score <= 8 THEN 3
            WHEN customer_satisfaction_score <= 10 THEN 4
          END AS sort_order
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND customer_satisfaction_score IS NOT NULL
          ${whereClause}
      )
      SELECT
        range,
        COUNT(*)::integer AS count
      FROM csat_bins
      WHERE range IS NOT NULL
      GROUP BY range, sort_order
      ORDER BY sort_order
    `;

    interface QueryResult {
      range: string;
      count: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    // Ensure all bins are present, even if count is zero
    const binRanges = ["1-3", "4-6", "7-8", "9-10"];
    const resultMap = new Map(result.rows.map((row) => [row.range, row.count]));

    return binRanges.map((range) => ({
      range,
      count:
        typeof resultMap.get(range) === "number"
          ? resultMap.get(range)!
          : parseInt(String(resultMap.get(range) || 0), 10),
    }));
  }
}

export const satisfactionModel = new SatisfactionModel();
