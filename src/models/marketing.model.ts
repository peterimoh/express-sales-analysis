import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type {
  MarketingPerformance,
  CohortRetention,
  ProductAffinity,
  DiscountImpact,
} from "#types/index.js";

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

  async getCohortRetention(
    params: GlobalFiltersParams
  ): Promise<CohortRetention[]> {
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
      WITH customer_first_purchase AS (
        SELECT
          customer_id,
          MIN(transaction_date)::DATE AS first_purchase_date,
          TO_CHAR(MIN(transaction_date), 'YYYY-MM') AS cohort_month
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND customer_id IS NOT NULL
          ${whereClause}
        GROUP BY customer_id
      ),
      customer_order_counts AS (
        SELECT
          customer_id,
          COUNT(*)::numeric AS order_count
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND customer_id IS NOT NULL
          ${whereClause}
        GROUP BY customer_id
      ),
      cohort_stats AS (
        SELECT
          cfp.cohort_month AS cohort,
          COUNT(DISTINCT cfp.customer_id)::integer AS total_customers,
          SUM(CASE WHEN coc.order_count > 1 THEN 1 ELSE 0 END)::integer AS repeat_customers,
          AVG(coc.order_count)::numeric AS avg_orders_per_customer
        FROM customer_first_purchase cfp
        JOIN customer_order_counts coc ON cfp.customer_id = coc.customer_id
        GROUP BY cfp.cohort_month
      )
      SELECT
        cohort,
        total_customers,
        repeat_customers,
        CASE
          WHEN total_customers > 0 THEN 
            ROUND((repeat_customers::numeric / total_customers::numeric) * 100, 2)
          ELSE 0
        END AS retention_rate,
        avg_orders_per_customer
      FROM cohort_stats
      ORDER BY cohort ASC
    `;

    interface QueryResult {
      cohort: string;
      total_customers: number;
      repeat_customers: number;
      retention_rate: number;
      avg_orders_per_customer: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure numeric values are properly converted
      const totalCustomersValue =
        typeof row.total_customers === "number"
          ? row.total_customers
          : parseInt(String(row.total_customers || 0), 10);

      const repeatCustomersValue =
        typeof row.repeat_customers === "number"
          ? row.repeat_customers
          : parseInt(String(row.repeat_customers || 0), 10);

      const retentionRateValue =
        typeof row.retention_rate === "number"
          ? row.retention_rate
          : parseFloat(String(row.retention_rate || 0));

      const avgOrdersValue =
        typeof row.avg_orders_per_customer === "number"
          ? row.avg_orders_per_customer
          : parseFloat(String(row.avg_orders_per_customer || 0));

      return {
        cohort: row.cohort,
        totalCustomers: totalCustomersValue,
        repeatCustomers: repeatCustomersValue,
        avgOrdersPerCustomer: avgOrdersValue.toFixed(2),
        retentionRate: retentionRateValue.toFixed(2),
      };
    });
  }

  async getProductAffinities(
    params: GlobalFiltersParams
  ): Promise<ProductAffinity[]> {
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
      // Exclude productCategory filter since we're analyzing product pairs
      // This would limit results too much
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
      WITH customer_products AS (
        SELECT DISTINCT
          customer_id,
          product_category
        FROM ${this.tableName}
        WHERE transaction_date >= $1::DATE
          AND transaction_date < $2::DATE
          AND customer_id IS NOT NULL
          AND product_category IS NOT NULL
          ${whereClause}
      ),
      product_pairs AS (
        SELECT
          cp1.customer_id,
          cp1.product_category AS product1,
          cp2.product_category AS product2,
          CASE
            WHEN cp1.product_category < cp2.product_category THEN
              cp1.product_category || ' + ' || cp2.product_category
            ELSE
              cp2.product_category || ' + ' || cp1.product_category
          END AS pair
        FROM customer_products cp1
        JOIN customer_products cp2 ON cp1.customer_id = cp2.customer_id
        WHERE cp1.product_category < cp2.product_category
      )
      SELECT
        pair,
        COUNT(DISTINCT customer_id)::integer AS count
      FROM product_pairs
      GROUP BY pair
      ORDER BY count DESC
      LIMIT 10
    `;

    interface QueryResult {
      pair: string;
      count: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      // Ensure count is properly converted
      const countValue =
        typeof row.count === "number"
          ? row.count
          : parseInt(String(row.count || 0), 10);

      return {
        pair: row.pair,
        count: countValue,
      };
    });
  }

  async getDiscountImpact(
    params: GlobalFiltersParams
  ): Promise<DiscountImpact> {
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
        -- With Discount metrics
        SUM(CASE WHEN discount_applied > 0 THEN 1 ELSE 0 END)::integer AS with_discount_orders,
        SUM(CASE WHEN discount_applied > 0 THEN total_amount ELSE 0 END)::numeric AS with_discount_revenue,
        SUM(CASE WHEN discount_applied > 0 THEN total_profit ELSE 0 END)::numeric AS with_discount_profit,
        AVG(CASE WHEN discount_applied > 0 THEN discount_applied ELSE NULL END)::numeric AS with_discount_avg_discount,
        -- Without Discount metrics
        SUM(CASE WHEN discount_applied = 0 OR discount_applied IS NULL THEN 1 ELSE 0 END)::integer AS without_discount_orders,
        SUM(CASE WHEN discount_applied = 0 OR discount_applied IS NULL THEN total_amount ELSE 0 END)::numeric AS without_discount_revenue,
        SUM(CASE WHEN discount_applied = 0 OR discount_applied IS NULL THEN total_profit ELSE 0 END)::numeric AS without_discount_profit
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        ${whereClause}
    `;

    interface QueryResult {
      with_discount_orders: number;
      with_discount_revenue: number;
      with_discount_profit: number;
      with_discount_avg_discount: number | null;
      without_discount_orders: number;
      without_discount_revenue: number;
      without_discount_profit: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);
    const row = result.rows[0];

    // Ensure numeric values are properly converted
    const withDiscountOrdersValue =
      typeof row.with_discount_orders === "number"
        ? row.with_discount_orders
        : parseInt(String(row.with_discount_orders || 0), 10);

    const withDiscountRevenueValue =
      typeof row.with_discount_revenue === "number"
        ? row.with_discount_revenue
        : parseFloat(String(row.with_discount_revenue || 0));

    const withDiscountProfitValue =
      typeof row.with_discount_profit === "number"
        ? row.with_discount_profit
        : parseFloat(String(row.with_discount_profit || 0));

    const withDiscountAvgDiscountValue =
      row.with_discount_avg_discount !== null &&
      row.with_discount_avg_discount !== undefined
        ? typeof row.with_discount_avg_discount === "number"
          ? row.with_discount_avg_discount
          : parseFloat(String(row.with_discount_avg_discount)) || 0
        : 0;

    const withoutDiscountOrdersValue =
      typeof row.without_discount_orders === "number"
        ? row.without_discount_orders
        : parseInt(String(row.without_discount_orders || 0), 10);

    const withoutDiscountRevenueValue =
      typeof row.without_discount_revenue === "number"
        ? row.without_discount_revenue
        : parseFloat(String(row.without_discount_revenue || 0));

    const withoutDiscountProfitValue =
      typeof row.without_discount_profit === "number"
        ? row.without_discount_profit
        : parseFloat(String(row.without_discount_profit || 0));

    return {
      withDiscount: {
        orders: withDiscountOrdersValue,
        revenue: withDiscountRevenueValue,
        profit: withDiscountProfitValue,
        avgDiscount: withDiscountAvgDiscountValue.toFixed(2),
      },
      withoutDiscount: {
        orders: withoutDiscountOrdersValue,
        revenue: withoutDiscountRevenueValue,
        profit: withoutDiscountProfitValue,
      },
    };
  }
}

export const marketingModel = new MarketingModel();
