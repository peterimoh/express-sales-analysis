// Re-export types from types/index.ts for convenience
export type {
  Filter,
  KPIs,
  TableMetadata,
  Revenue,
  CategoryRevenue,
  CustomerRevenue,
  CLVDistribution,
  ChannelMix,
  GlobalFiltersParams,
  OptionalGlobalFilters,
} from "#types/index.js";

// Filters model
export { FiltersModel, filtersModel } from "./filters.model.js";

// KPIs model
export { KPIsModel, kpisModel } from "./kpis.model.js";

// Metadata model
export { MetadataModel, metadataModel } from "./metadata.model.js";

// Revenue model
export { RevenueModel, revenueModel } from "./revenue.model.js";

// Customer model
export { CustomerModel, customerModel } from "./customer.model.js";

// Channel model
export { ChannelModel, channelModel } from "./channel.model.js";

// Base model
export { BaseModel } from "./base.model.js";
