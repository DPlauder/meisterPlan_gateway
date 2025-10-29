import { Request, Response } from "express";
import { jest, expect } from "@jest/globals";

/**
 * Mock für Express Request-Objekte
 */
export const mockRequest = (
  overrides: Partial<Request> = {}
): Partial<Request> => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  method: "GET",
  url: "/",
  path: "/",
  ...overrides,
});

/**
 * Mock für Express Response-Objekte
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.send = jest.fn().mockReturnValue(res) as any;
  res.setHeader = jest.fn().mockReturnValue(res) as any;
  res.getHeader = jest.fn() as any;
  res.cookie = jest.fn().mockReturnValue(res) as any;
  return res;
};

/**
 * Generischer Service-Mock Generator
 */
export const mockService = <T extends object>(
  methods: (keyof T)[]
): jest.Mocked<T> => {
  const mock = {} as jest.Mocked<T>;
  methods.forEach((method) => {
    mock[method] = jest.fn() as any;
  });
  return mock;
};

/**
 * Mock-Daten für Tests
 */
export const mockData = {
  product: {
    id: "1",
    name: "Test Product",
    price: 99.99,
    description: "A test product",
    category: "Electronics",
  },

  products: [
    { id: "1", name: "Product 1", price: 29.99 },
    { id: "2", name: "Product 2", price: 39.99 },
    { id: "3", name: "Product 3", price: 49.99 },
  ],

  businessCustomer: {
    id: "1",
    name: "Test Customer",
    email: "test@example.com",
    phone: "+49123456789",
    address: {
      street: "Test Street 1",
      city: "Test City",
      postalCode: "12345",
      country: "Germany",
    },
  },

  businessCustomers: [
    { id: "1", name: "Customer 1", email: "customer1@example.com" },
    { id: "2", name: "Customer 2", email: "customer2@example.com" },
  ],

  inventory: {
    id: "1",
    productId: "1",
    quantity: 100,
    location: "Warehouse A",
    lastUpdated: new Date().toISOString(),
  },

  inventoryItem: {
    articleNum: "ART001",
    productName: "Test Product",
    quantity: 150,
    location: "Warehouse B",
    supplier: "Test Supplier",
    lastUpdated: new Date().toISOString(),
  },

  inventoryItems: [
    {
      articleNum: "ART001",
      productName: "Product 1",
      quantity: 100,
      location: "Warehouse A",
    },
    {
      articleNum: "ART002",
      productName: "Product 2",
      quantity: 200,
      location: "Warehouse B",
    },
    {
      articleNum: "ART003",
      productName: "Product 3",
      quantity: 50,
      location: "Warehouse C",
    },
  ],
};

/**
 * Async Error Helper für Promise-Tests
 */
export const expectAsync = {
  toReject: async (promise: Promise<any>, expectedError?: string | RegExp) => {
    try {
      await promise;
      throw new Error("Expected promise to reject but it resolved");
    } catch (error) {
      if (expectedError && error instanceof Error) {
        if (typeof expectedError === "string") {
          expect(error.message).toContain(expectedError);
        } else {
          expect(error.message).toMatch(expectedError);
        }
      }
      return error;
    }
  },

  toResolve: async (promise: Promise<any>) => {
    try {
      const result = await promise;
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Expected promise to resolve but it rejected with: ${errorMessage}`
      );
    }
  },
};

/**
 * HTTP Status Code Constants für Tests
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUEST_ENTITY_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
} as const;
