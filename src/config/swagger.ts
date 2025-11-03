import swaggerJsdoc from "swagger-jsdoc";
import type { SwaggerDefinition } from "swagger-jsdoc";
import dotenv from "dotenv";
dotenv.config();

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sales HQ API",
    version: "1.0.0",
    description:
      "Comprehensive API documentation for Sales HQ analytics and management platform.",
    contact: {
      name: "API Support",
      email: "support@saleshq.com",
    },
    license: {
      name: "Proprietary",
    },
  },
  schemes: ["http", "https"],
  servers: [
    {
      url:
        process.env.API_URL + "/api" ||
        `http://localhost:${process.env.PORT}/api`,
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
        description:
          "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
      },
    },
    schemas: {
      // Auth Schemas
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "password123",
          },
        },
      },
      CreateAdminRequest: {
        type: "object",
        required: ["email", "password", "fullName"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "newadmin@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "SecurePass123",
          },
          fullName: {
            type: "string",
            minLength: 1,
            example: "John Doe",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: {
            type: "string",
            example: "oldPassword123",
          },
          newPassword: {
            type: "string",
            minLength: 8,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)",
            example: "NewSecurePass123",
            description:
              "Must contain at least one uppercase, one lowercase, and one number",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              user: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  email: { type: "string", example: "admin@example.com" },
                  role: {
                    type: "string",
                    enum: ["super_admin", "admin"],
                    example: "admin",
                  },
                  is_password_reset_required: {
                    type: "boolean",
                    example: false,
                  },
                },
              },
            },
          },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              email: { type: "string", example: "admin@example.com" },
              role: {
                type: "string",
                enum: ["super_admin", "admin"],
                example: "admin",
              },
              is_password_reset_required: { type: "boolean", example: false },
              last_login: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              created_at: { type: "string", format: "date-time" },
            },
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
        },
      },
      // Global Filter Schema
      GlobalFilters: {
        type: "object",
        required: ["startDate", "endDate"],
        properties: {
          startDate: {
            type: "string",
            format: "date",
            example: "2024-01-01",
            description: "Start date in YYYY-MM-DD format",
          },
          endDate: {
            type: "string",
            format: "date",
            example: "2024-12-31",
            description: "End date in YYYY-MM-DD format",
          },
          country: {
            type: "string",
            example: "USA",
            description: "Optional country filter",
          },
          productCategory: {
            type: "string",
            example: "Electronics",
            description: "Optional product category filter",
          },
          marketingChannel: {
            type: "string",
            example: "Email",
            description: "Optional marketing channel filter",
          },
          customerSegment: {
            type: "string",
            example: "High Value",
            description: "Optional customer segment filter",
          },
        },
      },
      // Error Schemas
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Error message description",
          },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Validation failed",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "array", items: { type: "string" } },
                message: { type: "string" },
              },
            },
          },
        },
      },
      // Data Response Schemas
      FiltersResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              countries: {
                type: "array",
                items: { type: "string" },
                example: ["USA", "UK", "Canada"],
              },
              categories: {
                type: "array",
                items: { type: "string" },
                example: ["Electronics", "Clothing", "Books"],
              },
              channels: {
                type: "array",
                items: { type: "string" },
                example: ["Email", "Social Media", "Direct"],
              },
              segments: {
                type: "array",
                items: { type: "string" },
                example: ["High Value", "Medium Value", "Low Value"],
              },
            },
          },
        },
      },
      KPIsResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              revenue_current: { type: "number", example: 1250000.5 },
              profit_current: { type: "number", example: 312500.25 },
              orders_current: { type: "integer", example: 12500 },
              aov_current: { type: "number", example: 100.0 },
              profit_margin_current: { type: "number", example: 25.0 },
              revenue_delta_pct: { type: "number", example: 15.5 },
              profit_delta_pct: { type: "number", example: 12.3 },
              orders_delta_pct: { type: "number", example: 8.7 },
              nps_pct_current: {
                type: "number",
                nullable: true,
                example: 75.5,
              },
              nps_avg_score_current: {
                type: "number",
                nullable: true,
                example: 8.2,
              },
            },
          },
        },
      },
      RevenueTrendsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", format: "date", example: "2024-01-01" },
                orders: { type: "integer", example: 150 },
                revenue: { type: "number", example: 15000.0 },
                profit: { type: "number", example: 3750.0 },
              },
            },
          },
        },
      },
      CategoryRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", example: "Electronics" },
                orders: { type: "integer", example: 500 },
                revenue: { type: "number", example: 50000.0 },
                profit: { type: "number", example: 12500.0 },
                units: { type: "integer", example: 750 },
                avgPrice: { type: "number", example: 66.67 },
                margin: { type: "string", example: "25.00%" },
              },
            },
          },
        },
      },
      CustomerRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                customer_id: { type: "string", example: "CUST001" },
                name: { type: "string", example: "John Doe" },
                frequency: { type: "integer", example: 12 },
                monetary: { type: "number", example: 5000.0 },
                clv: { type: "number", example: 15000.0 },
              },
            },
          },
        },
      },
      RegionRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: { type: "string", example: "North America" },
                revenue: { type: "number", example: 250000.0 },
                orders: { type: "integer", example: 2500 },
                profit: { type: "number", example: 62500.0 },
              },
            },
          },
        },
      },
      CountryRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                country: { type: "string", example: "USA" },
                revenue: { type: "number", example: 125000.0 },
                orders: { type: "integer", example: 1250 },
                profit: { type: "number", example: 31250.0 },
                revenueShare: { type: "string", example: "35.5%" },
              },
            },
          },
        },
      },
      AgeRangeRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ageRange: { type: "string", example: "25-34" },
                orders: { type: "integer", example: 500 },
                revenue: { type: "number", example: 50000.0 },
                profit: { type: "number", example: 12500.0 },
                avgSatisfaction: { type: "string", example: "8.50" },
                margin: { type: "string", example: "25.00%" },
              },
            },
          },
        },
      },
      GenderRevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gender: { type: "string", example: "Male" },
                orders: { type: "integer", example: 600 },
                revenue: { type: "number", example: 60000.0 },
                profit: { type: "number", example: 15000.0 },
                avgSatisfaction: { type: "string", example: "8.25" },
                margin: { type: "string", example: "25.00%" },
              },
            },
          },
        },
      },
      SKURevenueResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string", example: "SKU-001" },
                orders: { type: "integer", example: 100 },
                revenue: { type: "number", example: 10000.0 },
                profit: { type: "number", example: 2500.0 },
                units: { type: "integer", example: 150 },
                avgPrice: { type: "number", example: 66.67 },
                margin: { type: "string", example: "25.00%" },
              },
            },
          },
        },
      },
      CLVDistributionResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                range: { type: "string", example: "$0-$1000" },
                count: { type: "integer", example: 500 },
              },
            },
          },
        },
      },
      ChannelMixResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                channel: { type: "string", example: "Email" },
                orders: { type: "integer", example: 500 },
                revenue: { type: "number", example: 50000.0 },
                profit: { type: "number", example: 12500.0 },
                abandonment: { type: "integer", example: 50 },
                abandonmentRate: { type: "string", example: "10.00%" },
              },
            },
          },
        },
      },
      ChannelPerformanceResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                channel: { type: "string", example: "Email" },
                orders: { type: "integer", example: 500 },
                revenue: { type: "number", example: 50000.0 },
                profit: { type: "number", example: 12500.0 },
                aov: { type: "number", example: 100.0 },
                profitMargin: { type: "string", example: "25.00%" },
                revenueShare: { type: "string", example: "40.00%" },
                abandonment: { type: "integer", example: 50 },
                abandonmentRate: { type: "string", example: "10.00%" },
              },
            },
          },
        },
      },
      MarketingPerformanceResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: { type: "string", example: "North America" },
                revenue: { type: "number", example: 250000.0 },
                orders: { type: "integer", example: 2500 },
              },
            },
          },
        },
      },
      GeographicPerformanceResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                country: { type: "string", example: "USA" },
                region: { type: "string", example: "West" },
                orders: { type: "integer", example: 500 },
                revenue: { type: "number", example: 50000.0 },
                profit: { type: "number", example: 12500.0 },
                margin: { type: "string", example: "25.00%" },
                customersCount: { type: "integer", example: 250 },
              },
            },
          },
        },
      },
      SatisfactionResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", example: "Electronics" },
                avgNPS: { type: "string", example: "8.5" },
                avgCSAT: { type: "string", example: "8.2" },
                revenue: { type: "number", example: 50000.0 },
              },
            },
          },
        },
      },
      NPSDistributionResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                range: { type: "string", example: "0-6" },
                count: { type: "integer", example: 100 },
              },
            },
          },
        },
      },
      CSATDistributionResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                range: { type: "string", example: "7-8" },
                count: { type: "integer", example: 200 },
              },
            },
          },
        },
      },
      PaymentMethodsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                method: { type: "string", example: "Credit Card" },
                orders: { type: "integer", example: 1000 },
                revenue: { type: "number", example: 100000.0 },
                avgTransactionValue: { type: "string", example: "100.00" },
                successRate: { type: "string", example: "99.5%" },
              },
            },
          },
        },
      },
      SegmentPerformanceResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                segment: { type: "string", example: "High Value" },
                customersCount: { type: "integer", example: 500 },
                orders: { type: "integer", example: 2000 },
                revenue: { type: "number", example: 200000.0 },
                avgCLV: { type: "string", example: "1500.00" },
                margin: { type: "string", example: "25.00%" },
              },
            },
          },
        },
      },
      CohortRetentionResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cohort: { type: "string", example: "2024-01" },
                totalCustomers: { type: "integer", example: 500 },
                repeatCustomers: { type: "integer", example: 250 },
                avgOrdersPerCustomer: { type: "string", example: "2.50" },
                retentionRate: { type: "string", example: "50.00%" },
              },
            },
          },
        },
      },
      ProductAffinitiesResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pair: { type: "string", example: "Electronics + Accessories" },
                count: { type: "integer", example: 150 },
              },
            },
          },
        },
      },
      DiscountImpactResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              withDiscount: {
                type: "object",
                properties: {
                  orders: { type: "integer", example: 500 },
                  revenue: { type: "number", example: 45000.0 },
                  profit: { type: "number", example: 9000.0 },
                  avgDiscount: { type: "string", example: "10.00" },
                },
              },
              withoutDiscount: {
                type: "object",
                properties: {
                  orders: { type: "integer", example: 300 },
                  revenue: { type: "number", example: 30000.0 },
                  profit: { type: "number", example: 7500.0 },
                },
              },
            },
          },
        },
      },
      MetadataResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              lastUpdated: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2024-01-15T10:30:00Z",
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./dist/src/routes/**/*.js",
    "./dist/src/controllers/**/*.js",
    "../routes/**/*.ts",
    "../controllers/**/*.ts",
    "../../dist/src/routes/**/*.js",
    "../../dist/src/controllers/**/*.js",
    "../../../routes/**/*.ts",
    "../../../controllers/**/*.ts",
    "../../../../dist/src/routes/**/*.js",
    "../../../../dist/src/controllers/**/*.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
