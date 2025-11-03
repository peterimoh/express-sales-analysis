# Swagger/OpenAPI Documentation Setup

## Overview

Complete OpenAPI/Swagger documentation has been set up for all API endpoints in the Sales HQ backend. All endpoints are documented with proper schemas, request/response examples, and security requirements.

## Access

Once the server is running, access the Swagger UI at:
- **Development**: `http://localhost:3000/api-docs`
- **Production**: `{API_URL}/api-docs`

## Features

### Production-Ready Configuration

1. **JWT Bearer Token Authentication**: All endpoints (except login) require Bearer token authentication
2. **Comprehensive Schemas**: All request/response models are fully documented with examples
3. **Error Responses**: All endpoints document potential error responses (400, 401, 403, 404, 409, 500)
4. **Query Parameters**: All filter parameters are documented with proper types and examples
5. **Persistent Authorization**: Swagger UI saves authorization tokens for easier testing
6. **Request Duration**: Displays response times in Swagger UI
7. **Filter/Search**: Ability to filter endpoints in the UI

### Documented Endpoints

#### Authentication (`/api/auth`)
- `POST /auth/login` - User login (public, no auth required)
- `GET /auth/profile` - Get current user profile (requires auth)
- `POST /auth/reset-password` - Reset user password (requires auth)
- `POST /auth/admins` - Create new admin (requires super_admin role)

#### Version 1 API (`/api/v1`)

**Revenue** (`/v1/revenue`)
- `GET /v1/revenue` - Revenue trends over time
- `GET /v1/revenue/categories` - Revenue by product category
- `GET /v1/revenue/top-customers` - Top customers by revenue
- `GET /v1/revenue/top-regions` - Revenue by top regions
- `GET /v1/revenue/by-country` - Revenue breakdown by country
- `GET /v1/revenue/by-age-range` - Revenue by customer age range
- `GET /v1/revenue/by-gender` - Revenue by customer gender
- `GET /v1/revenue/top-skus` - Top SKUs by revenue

**KPIs** (`/v1/kpis`)
- `GET /v1/kpis` - Key performance indicators

**Marketing** (`/v1/marketing`)
- `GET /v1/marketing/performance` - Marketing performance by location
- `GET /v1/marketing/cohort-retention` - Customer cohort retention analysis
- `GET /v1/marketing/product-affinities` - Products frequently bought together
- `GET /v1/marketing/discount-impact` - Discount impact analysis

**Customers** (`/v1/customers`)
- `GET /v1/customers/clv-distribution` - Customer lifetime value distribution

**Channels** (`/v1/channels`)
- `GET /v1/channels/mix` - Channel mix analysis
- `GET /v1/channels/performance` - Detailed channel performance metrics

**Geographic** (`/v1/geographic`)
- `GET /v1/geographic/regional` - Regional performance by country and region

**Satisfaction** (`/v1/satisfaction`)
- `GET /v1/satisfaction` - Customer satisfaction metrics by category
- `GET /v1/satisfaction/nps-distribution` - Net Promoter Score distribution
- `GET /v1/satisfaction/csat-distribution` - Customer Satisfaction score distribution

**Payment** (`/v1/payment`)
- `GET /v1/payment` - Payment method performance and statistics

**Segments** (`/v1/segments`)
- `GET /v1/segments` - Customer segment performance metrics

**Filters** (`/v1/filters`)
- `GET /v1/filters` - Available filter options for the dashboard

**Metadata** (`/v1/metadata`)
- `GET /v1/metadata/last-update` - Last update timestamp for data tables

## Security

All endpoints (except `/auth/login`) require JWT Bearer token authentication:

1. Login at `/api/auth/login` to get a JWT token
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer {your_jwt_token}`
4. The token will be persisted for all subsequent requests

## Usage in Swagger UI

1. **Try It Out**: Click on any endpoint to expand and see details
2. **Try It Out**: Click the "Try it out" button to test the endpoint
3. **Authorize**: Click the lock icon or "Authorize" button to add your Bearer token
4. **Execute**: Fill in parameters and click "Execute" to make a request
5. **Filter**: Use the filter box at the top to search for specific endpoints

## Technical Details

### Files Modified/Created

1. **`src/config/swagger.ts`**: Complete OpenAPI 3.0 specification with all schemas
2. **`src/index.ts`**: Added Swagger UI middleware
3. **All route files**: Added JSDoc annotations with `@swagger` comments

### Dependencies Added

- `swagger-ui-express`: Swagger UI Express middleware
- `swagger-jsdoc`: Generates OpenAPI spec from JSDoc comments
- `@types/swagger-ui-express`: TypeScript types
- `@types/swagger-jsdoc`: TypeScript types

### Configuration

The Swagger spec includes:
- OpenAPI 3.0.0 specification
- Bearer JWT authentication scheme
- Comprehensive schema definitions for all request/response types
- Global security requirement (can be overridden per endpoint)
- Server configuration based on environment

## Environment Variables

Set `API_URL` environment variable in production to ensure correct server URLs in documentation:

```env
API_URL=https://api.yourdomain.com/api
```

## Notes

- The `/auth/login` endpoint is the only public endpoint (marked with `security: []`)
- All other endpoints require Bearer token authentication
- The Swagger UI is accessible at `/api-docs` and is production-ready
- Authorization tokens persist across page refreshes for convenience

