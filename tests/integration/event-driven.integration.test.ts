import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import { App } from "../../src/App";
import { ServiceEventBus } from "../../src/events/ServiceEventBus";

describe("Event-driven Integration Tests", () => {
  let app: App;
  let eventBus: ServiceEventBus;

  beforeEach(() => {
    // EventBus-Singleton zurücksetzen für jeden Test
    (ServiceEventBus as any).instance = undefined;
    app = new App();
    eventBus = ServiceEventBus.getInstance();
  });

  afterEach(() => {
    app.cleanup();
  });

  describe("Product-Inventory Event Flow", () => {
    it("should create product via V2 API and trigger inventory event", async () => {
      const newProduct = {
        name: "Event Test Product",
        price: 299.99,
        supplier: "Event Supplier",
      };

      // Event-Listener registrieren um zu prüfen ob Event ausgelöst wird
      let eventReceived = false;
      let receivedEventData: any = null;

      eventBus.on("product.created", (eventData) => {
        eventReceived = true;
        receivedEventData = eventData;
      });

      // Product über Event-driven API erstellen
      const response = await request(app.getApp())
        .post("/products")
        .send(newProduct);

      // Kurz warten damit Event-Handler abarbeiten kann
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Überprüfungen
      expect(response.status).toBe(201);
      expect(eventReceived).toBe(true);
      expect(receivedEventData).toMatchObject({
        productData: expect.objectContaining({
          name: "Event Test Product",
          price: 299.99,
          supplier: "Event Supplier",
        }),
        timestamp: expect.any(Date),
      });
    });

    it("should update product via V2 API and trigger inventory event", async () => {
      const productId = "PROD-UPDATE-EVENT";
      const updateData = {
        name: "Updated Event Product",
        supplier: "Updated Event Supplier",
      };

      let eventReceived = false;
      let receivedEventData: any = null;

      eventBus.on("product.updated", (eventData) => {
        eventReceived = true;
        receivedEventData = eventData;
      });

      const response = await request(app.getApp())
        .put(`/products/${productId}`)
        .send(updateData);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(response.status).toBe(200);
      expect(eventReceived).toBe(true);
      expect(receivedEventData).toMatchObject({
        productId,
        productData: updateData,
        timestamp: expect.any(Date),
      });
    });

    it("should delete product via V2 API and trigger inventory event", async () => {
      const productId = "PROD-DELETE-EVENT";

      let eventReceived = false;
      let receivedEventData: any = null;

      eventBus.on("product.deleted", (eventData) => {
        eventReceived = true;
        receivedEventData = eventData;
      });

      const response = await request(app.getApp()).delete(
        `/products/${productId}`
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(response.status).toBe(204);
      expect(eventReceived).toBe(true);
      expect(receivedEventData).toMatchObject({
        productId,
        timestamp: expect.any(Date),
      });
    });
  });

  describe("Event Bus Integration in App", () => {
    it("should initialize EventBus and InventorySyncHandler on app startup", () => {
      expect(eventBus).toBeDefined();
      expect(eventBus.listenerCount("product.created")).toBe(1);
      expect(eventBus.listenerCount("product.updated")).toBe(1);
      expect(eventBus.listenerCount("product.deleted")).toBe(1);
    });

    it("should cleanup event listeners on app cleanup", () => {
      const initialListeners = eventBus.listenerCount("product.created");
      expect(initialListeners).toBeGreaterThan(0);

      app.cleanup();

      // Nach cleanup sollten keine Listener mehr da sein
      expect(eventBus.listenerCount("product.created")).toBe(0);
      expect(eventBus.listenerCount("product.updated")).toBe(0);
      expect(eventBus.listenerCount("product.deleted")).toBe(0);
    });
  });

  describe("API Route Availability", () => {
    it("should return products as array", async () => {
      const response = await request(app.getApp()).get("/products").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should have legacy products routes still available", async () => {
      const response = await request(app.getApp()).get("/products").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Event-driven Error Handling", () => {
    it("should handle inventory sync errors gracefully without affecting product operations", async () => {
      const consoleWarnSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Event-Handler registrieren der einen Fehler wirft
      eventBus.on("product.created", () => {
        throw new Error("Inventory service down");
      });

      const newProduct = {
        name: "Error Test Product",
        price: 99.99,
      };

      // Product creation sollte trotz Inventory-Fehler funktionieren
      const response = await request(app.getApp())
        .post("/products")
        .send(newProduct);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(response.status).toBe(201);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});
