import { env } from "./env";

export const apiConfig = {
  businessCustomer: env.api.businessCustomerUrl,
  products: env.api.productsUrl,
  inventory: env.api.inventoryUrl,
};
