import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { App } from "../src/App";
import { HTTP_STATUS } from "./testUtils";

describe("App", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("App Initialization", () => {
    it("should create app instance successfully", () => {
      expect(app).toBeInstanceOf(App);
      expect(app.getApp()).toBeDefined();
    });

    it("should return Express application instance", () => {
      const expressApp = app.getApp();
      expect(typeof expressApp).toBe("function");
      expect(expressApp.listen).toBeDefined();
    });

    it("should initialize without throwing errors", () => {
      expect(() => new App()).not.toThrow();
    });
  });

  describe("Middleware Configuration", () => {
    it("should have JSON parsing middleware configured", async () => {
      // Test mit einem POST-Request der JSON parsen muss
      const response = await request(app.getApp())
        .post("/products")
        .send({ name: "Test Product" })
        .set("Content-Type", "application/json");

      // Status sollte nicht 400 (Bad Request) sein, was auf fehlendes JSON-Parsing hindeuten würde
      expect(response.status).not.toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should have CORS middleware configured", async () => {
      const response = await request(app.getApp())
        .options("/products")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET");

      // CORS sollte OPTIONS-Requests handhaben
      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should handle CORS preflight requests", async () => {
      const response = await request(app.getApp())
        .options("/business-customers")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type");

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
      expect(response.headers["access-control-allow-methods"]).toBeDefined();
    });
  });

  describe("Route Registration", () => {
    it("should have business-customers routes registered", async () => {
      const response = await request(app.getApp()).get("/business-customers");

      // Sollte nicht 404 sein (Route existiert)
      expect(response.status).not.toBe(HTTP_STATUS.NOT_FOUND);
    });

    it("should have products routes registered", async () => {
      const response = await request(app.getApp()).get("/products");

      // Sollte nicht 404 sein (Route existiert)
      expect(response.status).not.toBe(HTTP_STATUS.NOT_FOUND);
    });

    it("should have inventory routes registered", async () => {
      const response = await request(app.getApp()).get("/inventory");

      // Sollte nicht 404 sein (Route existiert)
      expect(response.status).not.toBe(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for unknown routes", async () => {
      const response = await request(app.getApp())
        .get("/non-existent-route")
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it("should handle invalid JSON in request body", async () => {
      const response = await request(app.getApp())
        .post("/products")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should handle missing Content-Type header", async () => {
      const response = await request(app.getApp())
        .post("/products")
        .send({ name: "Test" });

      // Sollte trotzdem verarbeitet werden können
      expect(response.status).not.toBe(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE);
    });
  });

  describe("HTTP Methods Support", () => {
    it("should support GET requests", async () => {
      const response = await request(app.getApp()).get("/products");

      expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response.status
      );
    });

    it("should support POST requests", async () => {
      const response = await request(app.getApp())
        .post("/products")
        .send({ name: "Test Product" });

      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);
    });

    it("should support DELETE requests", async () => {
      const response = await request(app.getApp()).delete("/products/1");

      expect([
        HTTP_STATUS.NO_CONTENT,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);
    });

    it("should support OPTIONS requests for CORS", async () => {
      const response = await request(app.getApp()).options("/products");

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
    });
  });

  describe("Request/Response Headers", () => {
    it("should set appropriate response headers", async () => {
      const response = await request(app.getApp()).get("/products");

      // Express setzt standardmäßig einige Header
      expect(response.headers["x-powered-by"]).toBeDefined();
    });

    it("should handle custom headers in requests", async () => {
      const response = await request(app.getApp())
        .get("/products")
        .set("Custom-Header", "test-value");

      // Request sollte verarbeitet werden unabhängig von custom headers
      expect(response.status).not.toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should support multiple content types", async () => {
      const jsonResponse = await request(app.getApp())
        .post("/products")
        .set("Content-Type", "application/json")
        .send({ name: "JSON Product" });

      expect(jsonResponse.status).not.toBe(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE);
    });
  });

  describe("Application Structure", () => {
    it("should have proper method binding", () => {
      expect(typeof app.getApp).toBe("function");

      // Test method binding
      const getAppMethod = app.getApp;
      expect(() => getAppMethod.call(app)).not.toThrow();
    });

    it("should maintain consistent app instance", () => {
      const appInstance1 = app.getApp();
      const appInstance2 = app.getApp();

      expect(appInstance1).toBe(appInstance2);
    });
  });
});
