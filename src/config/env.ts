import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Umgebungsvariable "${key}" ist nicht gesetzt.`);
  }
  return value;
}

export const env = {
  nodeEnv: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "staging"
    | "test",
  port: parseInt(process.env.PORT ?? "3000", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  api: {
    businessCustomerUrl: requireEnv(
      "BUSINESS_CUSTOMER_API_URL",
      "http://localhost:3001/api/business-customers",
    ),
    productsUrl: requireEnv(
      "PRODUCTS_API_URL",
      "http://localhost:8080/api/products",
    ),
    inventoryUrl: requireEnv(
      "INVENTORY_API_URL",
      "http://localhost:8081/api/inventory",
    ),
  },
};
