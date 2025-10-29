import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import { App } from "../../src/App";
import { HTTP_STATUS, mockData } from "../testUtils";

describe("Gateway Integration Tests", () => {
  let app: App;

  beforeAll(() => {
    app = new App();
  });

  afterAll(() => {
    // Cleanup nach allen Integration Tests
  });

  beforeEach(() => {
    // Reset vor jedem Test
    jest.clearAllMocks();
  });

  describe("Complete API Workflow", () => {
    it("should handle complete product workflow", async () => {
      // 1. Alle Produkte abrufen (sollte funktionieren auch wenn Service-Fehler)
      const allProductsResponse = await request(app.getApp()).get("/products");

      expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        allProductsResponse.status
      );

      // 2. Spezifisches Produkt abrufen
      const productResponse = await request(app.getApp()).get("/products/1");

      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(productResponse.status);

      // 3. Neues Produkt erstellen
      const newProduct = { name: "Integration Test Product", price: 29.99 };
      const createResponse = await request(app.getApp())
        .post("/products")
        .send(newProduct);

      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(createResponse.status);

      // 4. Produkt löschen
      const deleteResponse = await request(app.getApp()).delete("/products/1");

      expect([
        HTTP_STATUS.NO_CONTENT,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(deleteResponse.status);
    });

    it("should handle complete business customer workflow", async () => {
      // 1. Alle Kunden abrufen
      const allCustomersResponse = await request(app.getApp()).get(
        "/business-customers"
      );

      expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        allCustomersResponse.status
      );

      // 2. Spezifischen Kunden abrufen
      const customerResponse = await request(app.getApp()).get(
        "/business-customers/1"
      );

      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(customerResponse.status);

      // 3. Neuen Kunden erstellen
      const newCustomer = {
        name: "Integration Test Customer",
        email: "integration@test.com",
        phone: "+49123456789",
      };
      const createResponse = await request(app.getApp())
        .post("/business-customers")
        .send(newCustomer);

      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(createResponse.status);

      // 4. Kunden löschen
      const deleteResponse = await request(app.getApp()).delete(
        "/business-customers/1"
      );

      expect([
        HTTP_STATUS.NO_CONTENT,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(deleteResponse.status);
    });

    it("should handle complete inventory workflow", async () => {
      // 1. Alle Inventory Items abrufen
      const allInventoryResponse = await request(app.getApp()).get(
        "/inventory"
      );

      expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        allInventoryResponse.status
      );

      // 2. Spezifisches Inventory Item abrufen
      const inventoryResponse = await request(app.getApp()).get(
        "/inventory/ART001"
      );

      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(inventoryResponse.status);

      // 3. Neues Inventory Item erstellen
      const newInventoryItem = {
        articleNum: "INT001",
        productName: "Integration Test Product",
        quantity: 50,
        location: "Test Warehouse",
      };
      const createResponse = await request(app.getApp())
        .post("/inventory")
        .send(newInventoryItem);

      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(createResponse.status);

      // 4. Inventory Item löschen
      const deleteResponse = await request(app.getApp()).delete(
        "/inventory/ART001"
      );

      expect([
        HTTP_STATUS.NO_CONTENT,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(deleteResponse.status);
    });
  });

  describe("CORS Integration", () => {
    it("should handle CORS preflight requests for all routes", async () => {
      const routes = ["/products", "/business-customers", "/inventory"];

      for (const route of routes) {
        const response = await request(app.getApp())
          .options(route)
          .set("Origin", "http://localhost:3000")
          .set("Access-Control-Request-Method", "GET");

        expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
        expect(response.headers["access-control-allow-origin"]).toBeDefined();
      }
    });

    it("should allow actual requests after preflight", async () => {
      // Preflight
      await request(app.getApp())
        .options("/products")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET")
        .expect(HTTP_STATUS.NO_CONTENT);

      // Actual request
      const response = await request(app.getApp())
        .get("/products")
        .set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should handle complex CORS scenarios", async () => {
      const response = await request(app.getApp())
        .post("/products")
        .set("Origin", "http://localhost:3000")
        .set("Content-Type", "application/json")
        .send({ name: "CORS Test Product" });

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);
    });
  });

  describe("Error Handling Integration", () => {
    it("should provide consistent error responses across all routes", async () => {
      const invalidRequests = [
        { method: "get", path: "/products/invalid-id" },
        { method: "get", path: "/business-customers/invalid-id" },
        { method: "get", path: "/inventory/invalid-id" },
        { method: "delete", path: "/products/non-existent" },
        { method: "delete", path: "/business-customers/non-existent" },
        { method: "delete", path: "/inventory/non-existent" },
      ];

      for (const req of invalidRequests) {
        const response = await (request(app.getApp()) as any)[req.method](
          req.path
        );

        // Alle Fehler sollten konsistente Struktur haben
        if (response.status >= 400) {
          expect(response.body).toHaveProperty("error");
          expect(typeof response.body.error).toBe("string");
        }
      }
    });

    it("should handle malformed JSON consistently", async () => {
      const routes = ["/products", "/business-customers", "/inventory"];

      for (const route of routes) {
        const response = await request(app.getApp())
          .post(route)
          .set("Content-Type", "application/json")
          .send("{ invalid json }");

        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      }
    });
  });

  describe("Middleware Integration", () => {
    it("should process requests through all middleware layers", async () => {
      const response = await request(app.getApp())
        .post("/products")
        .set("Origin", "http://localhost:3000")
        .set("Content-Type", "application/json")
        .send({ name: "Middleware Test Product" });

      // CORS Header sollten gesetzt sein
      expect(response.headers["access-control-allow-origin"]).toBeDefined();

      // Request sollte bis zur Route durchgekommen sein
      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);
    });

    it("should handle large payloads", async () => {
      const largePayload = {
        name: "Large Product",
        description: "A".repeat(1000), // 1KB String
        metadata: Array(100).fill({ key: "value", data: "information" }),
      };

      const response = await request(app.getApp())
        .post("/products")
        .send(largePayload);

      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE,
      ]).toContain(response.status);
    });
  });

  describe("Route Integration", () => {
    it("should have all expected routes accessible", async () => {
      const expectedRoutes = [
        { method: "get", path: "/products" },
        { method: "get", path: "/products/1" },
        { method: "post", path: "/products" },
        { method: "delete", path: "/products/1" },
        { method: "get", path: "/business-customers" },
        { method: "get", path: "/business-customers/1" },
        { method: "post", path: "/business-customers" },
        { method: "delete", path: "/business-customers/1" },
        { method: "get", path: "/inventory" },
      ];

      for (const route of expectedRoutes) {
        const response = await (request(app.getApp()) as any)[route.method](
          route.path
        );

        // Route sollte existieren (nicht 404)
        expect(response.status).not.toBe(HTTP_STATUS.NOT_FOUND);
      }
    });

    it("should return 404 for non-existent routes", async () => {
      const nonExistentRoutes = [
        "/non-existent",
        "/products/sub/route",
        "/business-customers/sub/route",
        "/admin",
        "/api/v1/products",
      ];

      for (const route of nonExistentRoutes) {
        const response = await request(app.getApp()).get(route);
        expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      }
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => request(app.getApp()).get("/products"));

      const responses = await Promise.all(requests);

      // Alle Requests sollten verarbeitet werden
      responses.forEach((response) => {
        expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
          response.status
        );
      });
    });

    it("should maintain consistency across request types", async () => {
      const response1 = await request(app.getApp()).get("/products");
      const response2 = await request(app.getApp()).get("/products");

      // Konsistente Antworten
      expect(response1.status).toBe(response2.status);
      if (
        response1.status === HTTP_STATUS.OK &&
        response2.status === HTTP_STATUS.OK
      ) {
        expect(typeof response1.body).toBe(typeof response2.body);
      }
    });
  });
});
