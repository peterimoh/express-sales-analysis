import {
  GlobalFiltersParams,
  Revenue,
  CategoryRevenue,
  CustomerRevenue,
} from "#types/index.js";
import { BaseModel } from "./base.model.js";

export class RevenueModel extends BaseModel<Revenue> {
  protected tableName = "sales";

  async getTrends(params: GlobalFiltersParams): Promise<Revenue[]> {
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
      SELECT
        transaction_date::DATE AS date,
        COUNT(*)::numeric AS orders,
        SUM(total_amount)::numeric AS revenue,
        SUM(total_profit)::numeric AS profit
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        ${whereClause}
      GROUP BY transaction_date::DATE
      ORDER BY transaction_date::DATE ASC
    `;

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<Revenue>(query, queryParams);
    return result.rows;
  }

  async getCategories(params: GlobalFiltersParams): Promise<CategoryRevenue[]> {
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
        COUNT(*)::numeric AS orders,
        SUM(total_amount)::numeric AS revenue,
        SUM(total_profit)::numeric AS profit,
        SUM(quantity)::numeric AS units,
        CASE 
          WHEN COUNT(*) > 0 THEN ROUND(SUM(total_amount) / NULLIF(SUM(quantity), 0), 2)
          ELSE 0
        END AS avg_price,
        CASE
          WHEN SUM(total_amount) > 0 THEN 
            ROUND((SUM(total_profit) / NULLIF(SUM(total_amount), 0)) * 100, 2)
          ELSE 0
        END AS margin
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND product_category IS NOT NULL
        ${whereClause}
      GROUP BY product_category
      ORDER BY revenue DESC
    `;

    interface QueryResult {
      category: string;
      orders: number;
      revenue: number;
      profit: number;
      units: number;
      avg_price: number;
      margin: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    // Convert margin to string with 2 decimal places (to match mock function)
    return result.rows.map((row) => {
      // Ensure margin is a number before calling toFixed
      const marginValue =
        typeof row.margin === "number"
          ? row.margin
          : parseFloat(String(row.margin)) || 0;

      return {
        category: row.category,
        orders: row.orders,
        revenue: row.revenue,
        profit: row.profit,
        units: row.units,
        avgPrice: row.avg_price,
        margin: marginValue.toFixed(2),
      };
    });
  }

  async getTopCustomersByRevenue(
    params: GlobalFiltersParams
  ): Promise<CustomerRevenue[]> {
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
      SELECT
        customer_id,
        TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
        COUNT(*)::numeric AS frequency,
        SUM(total_amount)::numeric AS monetary,
        MAX(customer_lifetime_value)::numeric AS clv
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND customer_id IS NOT NULL
        ${whereClause}
      GROUP BY customer_id, first_name, last_name
      ORDER BY monetary DESC
      LIMIT 20
    `;

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<CustomerRevenue>(query, queryParams);
    return result.rows;
  }
}

export const revenueModel = new RevenueModel();
