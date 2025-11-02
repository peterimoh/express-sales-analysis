import {
  GlobalFiltersParams,
  Revenue,
  CategoryRevenue,
  CustomerRevenue,
  RegionRevenue,
  CountryRevenue,
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

  async getTopRegionsByRevenue(
    params: GlobalFiltersParams
  ): Promise<RegionRevenue[]> {
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
        COUNT(*)::numeric AS orders,
        SUM(total_profit)::numeric AS profit
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
    const result = await this.query<RegionRevenue>(query, queryParams);
    return result.rows;
  }

  async getRevenueByCountry(
    params: GlobalFiltersParams
  ): Promise<CountryRevenue[]> {
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
      WITH country_stats AS (
        SELECT
          country,
          SUM(total_amount)::numeric AS revenue,
          COUNT(*)::numeric AS orders,
          SUM(total_profit)::numeric AS profit
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND country IS NOT NULL
          ${whereClause}
        GROUP BY country
      ),
      total_revenue AS (
        SELECT SUM(revenue) AS total FROM country_stats
      )
      SELECT
        cs.country,
        cs.revenue,
        cs.orders,
        cs.profit,
        CASE
          WHEN tr.total > 0 THEN ROUND((cs.revenue / tr.total) * 100, 2)
          ELSE 0
        END AS revenue_share
      FROM country_stats cs, total_revenue tr
      ORDER BY cs.revenue DESC
    `;

    interface QueryResult {
      country: string;
      revenue: number;
      orders: number;
      profit: number;
      revenue_share: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure revenue_share is a number before converting to string
      const revenueShareValue =
        typeof row.revenue_share === "number"
          ? row.revenue_share
          : parseFloat(String(row.revenue_share)) || 0;

      return {
        country: row.country,
        revenue: row.revenue,
        orders: row.orders,
        profit: row.profit,
        revenueShare: revenueShareValue.toFixed(2),
      };
    });
  }
}

export const revenueModel = new RevenueModel();
