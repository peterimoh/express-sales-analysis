// Global Filter Types
export interface OptionalGlobalFilters {
  country?: string;
  productCategory?: string;
  marketingChannel?: string;
  customerSegment?: string;
}

export interface GlobalFiltersParams extends OptionalGlobalFilters {
  startDate: string;
  endDate: string;
}

// Filter Types
export interface Filter {
  countries?: string[];
  categories?: string[];
  channels?: string[];
  segments?: string[];
}

// KPI Types
export interface KPIs {
  revenue_current: number;
  profit_current: number;
  orders_current: number;
  aov_current: number;
  profit_margin_current: number;
  revenue_delta_pct: number;
  profit_delta_pct: number;
  orders_delta_pct: number;
  nps_pct_current: number | null;
  nps_avg_score_current: number | null;
}

// Metadata Types
export interface TableMetadata {
  lastUpdated: Date | null;
}

// Revenue Types
export interface Revenue {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
}

export interface CategoryRevenue {
  category: string;
  orders: number;
  revenue: number;
  profit: number;
  units: number;
  avgPrice: number;
  margin: string;
}

export interface CustomerRevenue {
  customer_id: string;
  name: string;
  frequency: number;
  monetary: number;
  clv: number;
}

export interface RegionRevenue {
  location: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface CountryRevenue {
  country: string;
  revenue: number;
  orders: number;
  profit: number;
  revenueShare: string; // Percentage of total revenue
}

export interface CLVDistribution {
  range: string;
  count: number;
}

export interface ChannelMix {
  channel: string;
  orders: number;
  revenue: number;
  profit: number;
  abandonment: number;
  abandonmentRate: string;
}

export interface ChannelPerformance {
  channel: string;
  orders: number;
  revenue: number;
  profit: number;
  aov: number;
  profitMargin: string;
  revenueShare: string; // Percentage of total revenue
  abandonment: number;
  abandonmentRate: string;
}

export interface MarketingPerformance {
  location: string;
  revenue: number;
  orders: number;
}

export interface GeographicPerformance {
  country: string;
  region: string;
  orders: number; // Changed from string to number
  revenue: number; // Changed from string to number
  profit: number; // Changed from string to number
  margin: string; // Percentage margin (string with 2 decimals)
  customersCount: number; // Changed from string to number
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Satisfaction {
  category: string;
  avgNPS: string; // Average NPS score (0-10) as string with 1 decimal
  avgCSAT: string; // Average CSAT score (0-10) as string with 1 decimal
  revenue: number;
}

export interface NPSDistribution {
  range: string;
  count: number;
}

export interface CSATDistribution {
  range: string;
  count: number;
}
