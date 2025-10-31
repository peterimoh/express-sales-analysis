export enum CacheKeys {
  FILTERS_V1 = "filters:v1",
  KPIS_V1 = "kpis:v1",
}

/**
 * Helper function to generate versioned cache keys
 * @param resource - The resource name (e.g., "filters")
 * @param version - The API version (e.g., "v1")
 * @returns The formatted cache key
 */
export function getCacheKey(resource: string, version: string = "v1"): string {
  return `${resource}:${version}`;
}
