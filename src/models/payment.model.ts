import { GlobalFiltersParams } from "#types/index.js";
import { BaseModel } from "./base.model.js";
import type { PaymentMethod } from "#types/index.js";

export class PaymentModel extends BaseModel<PaymentMethod> {
  protected tableName = "sales";

  async getPaymentMethods(
    params: GlobalFiltersParams
  ): Promise<PaymentMethod[]> {
    const {
      startDate,
      endDate,
      country,
      productCategory,
      marketingChannel,
      customerSegment,
    } = params;

    // Build optional WHERE conditions (exclude payment_method since we're grouping by it)
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

    // Calculate success rate: Assuming all records in sales table are successful transactions
    // If you have a transaction_status field, you can modify this query to calculate actual success rate
    const query = `
      SELECT
        payment_method AS method,
        COUNT(*)::integer AS orders,
        SUM(total_amount)::numeric AS revenue,
        ROUND(SUM(total_amount) / NULLIF(COUNT(*), 0), 2) AS avg_transaction_value,
        -- Success rate: Calculate as (successful transactions / total transactions) * 100
        -- Since all records in sales table are successful, this will be 100% for now
        -- If you have a transaction_status field, modify this to: 
        -- ROUND((SUM(CASE WHEN transaction_status = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2)
        100.0 AS success_rate_percent
      FROM ${this.tableName}
      WHERE transaction_date >= $1::DATE
        AND transaction_date < $2::DATE
        AND payment_method IS NOT NULL
        ${whereClause}
      GROUP BY payment_method
      ORDER BY revenue DESC
    `;

    interface QueryResult {
      method: string;
      orders: number;
      revenue: number;
      avg_transaction_value: number;
      success_rate_percent: number;
    }

    const queryParams = [startDate, endDate, ...filterConditions];
    const result = await this.query<QueryResult>(query, queryParams);

    return result.rows.map((row) => {
      const ordersValue =
        typeof row.orders === "number"
          ? row.orders
          : parseInt(String(row.orders || 0), 10);

      const revenueValue =
        typeof row.revenue === "number"
          ? row.revenue
          : parseFloat(String(row.revenue || 0));

      const avgTransactionValue =
        typeof row.avg_transaction_value === "number"
          ? row.avg_transaction_value
          : parseFloat(String(row.avg_transaction_value || 0));

      const successRatePercent =
        typeof row.success_rate_percent === "number"
          ? row.success_rate_percent
          : parseFloat(String(row.success_rate_percent || 100));

      return {
        method: row.method,
        orders: ordersValue,
        revenue: revenueValue,
        avgTransactionValue: avgTransactionValue.toFixed(2),
        successRate: `${successRatePercent.toFixed(1)}%`,
      };
    });
  }
}

export const paymentModel = new PaymentModel();
