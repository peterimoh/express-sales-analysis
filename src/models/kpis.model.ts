import { GlobalFiltersParams, KPIs } from "#types/index.js";
import { BaseModel } from "./base.model.js";

export class KPIsModel extends BaseModel<KPIs> {
  protected tableName = "sales";

  async getKPIs(params: GlobalFiltersParams): Promise<KPIs | null> {
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
      filters.push(`s.country = $${filterConditions.length + 3}`);
      filterConditions.push(country);
    }
    if (productCategory) {
      filters.push(`s.product_category = $${filterConditions.length + 3}`);
      filterConditions.push(productCategory);
    }
    if (marketingChannel) {
      filters.push(`s.marketing_channel = $${filterConditions.length + 3}`);
      filterConditions.push(marketingChannel);
    }
    if (customerSegment) {
      filters.push(`s.customer_segment = $${filterConditions.length + 3}`);
      filterConditions.push(customerSegment);
    }

    const whereClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      WITH
      params AS (
        SELECT
          $1::DATE AS start_date,
          $2::DATE AS end_date
      ),
      win AS (
        SELECT
          start_date,
          end_date,
          (end_date - start_date) AS period_days
        FROM params
      ),
      curr AS (
        SELECT
          SUM(total_amount)::numeric                   AS revenue,
          SUM(total_profit)::numeric                   AS profit,
          COUNT(*)::numeric                            AS orders,
          AVG(NULLIF(net_promoter_score, NULL))::numeric AS avg_nps_score,
          SUM(CASE WHEN net_promoter_score BETWEEN 9 AND 10 THEN 1 ELSE 0 END)::numeric AS nps_promoters,
          SUM(CASE WHEN net_promoter_score BETWEEN 0 AND 6  THEN 1 ELSE 0 END)::numeric AS nps_detractors,
          COUNT(net_promoter_score)::numeric           AS nps_responses
        FROM ${this.tableName} s
        JOIN win w ON s.transaction_date >= w.start_date
                  AND s.transaction_date <  w.end_date
        ${whereClause}
      ),
      prev AS (
        SELECT
          SUM(total_amount)::numeric                   AS revenue,
          SUM(total_profit)::numeric                   AS profit,
          COUNT(*)::numeric                            AS orders
        FROM ${this.tableName} s
        JOIN win w ON s.transaction_date >= (w.start_date - w.period_days)
                  AND s.transaction_date <  w.start_date
        ${whereClause}
      )
      SELECT
        curr.revenue                                   AS revenue_current,
        curr.profit                                    AS profit_current,
        curr.orders                                    AS orders_current,
        ROUND(curr.revenue / NULLIF(curr.orders, 0), 2)                 AS aov_current,
        ROUND(curr.profit  / NULLIF(curr.revenue, 0), 4)                AS profit_margin_current,
        ROUND( (curr.revenue - NULLIF(prev.revenue,0)) / NULLIF(prev.revenue,0) * 100, 2) AS revenue_delta_pct,
        ROUND( (curr.profit  - NULLIF(prev.profit,0))  / NULLIF(prev.profit,0)  * 100, 2) AS profit_delta_pct,
        ROUND( (curr.orders  - NULLIF(prev.orders,0))  / NULLIF(prev.orders,0)  * 100, 2) AS orders_delta_pct,
        CASE
          WHEN curr.nps_responses > 0 THEN
            ROUND( ( (curr.nps_promoters / curr.nps_responses) - (curr.nps_detractors / curr.nps_responses) ) * 100, 2)
          ELSE NULL
        END                                             AS nps_pct_current,
        ROUND(curr.avg_nps_score, 2)                    AS nps_avg_score_current
      FROM curr, prev
    `;

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<KPIs>(query, queryParams);
    return result.rows[0] || null;
  }
}

export const kpisModel = new KPIsModel();
