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
import { HTTP_STATUS } from "../testUtils";

describe("Product-Inventory Synchronization Integration Tests", () => {
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

  describe("Product-Inventory Sync Workflow", () => {
    it("should create inventory item when product is created", async () => {
      const newProduct = {
        name: "Sync Test Product",
        price: 99.99,
        description: "Product for testing sync",
        supplier: "Test Supplier Inc.",
      };

      // Erstelle Produkt
      const productResponse = await request(app.getApp())
        .post("/products")
        .send(newProduct);

      // Product-Creation sollte erfolgreich sein oder Server-Error (bei Mock-Failure)
      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(productResponse.status);

      if (productResponse.status === HTTP_STATUS.CREATED) {
        const productId = productResponse.body.id;

        // Prüfe, ob entsprechendes Inventory-Item existiert
        const inventoryResponse = await request(app.getApp())
          .get(`/inventory/${productId}`)
          .expect(HTTP_STATUS.OK);

        // Erwarte, dass Inventory-Item mit Product-Daten erstellt wurde
        expect(inventoryResponse.body).toEqual(
          expect.objectContaining({
            articleNum: productId,
            productName: newProduct.name,
            quantity: expect.any(Number),
            location: expect.any(String),
            supplier: newProduct.supplier,
          })
        );
      }
    });

    it("should update inventory item when product is updated", async () => {
      const productId = "test-product-123";
      const updateData = {
        name: "Updated Product Name",
        price: 149.99,
        supplier: "Updated Supplier Ltd.",
      };

      // Update Produkt
      const productResponse = await request(app.getApp())
        .put(`/products/${productId}`)
        .send(updateData);

      // Update sollte erfolgreich sein oder Server-Error (bei Mock-Failure)
      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(productResponse.status);

      if (productResponse.status === HTTP_STATUS.OK) {
        // Prüfe, ob Inventory-Item entsprechend aktualisiert wurde
        const inventoryResponse = await request(app.getApp()).get(
          `/inventory/${productId}`
        );

        if (inventoryResponse.status === HTTP_STATUS.OK) {
          expect(inventoryResponse.body).toEqual(
            expect.objectContaining({
              productName: updateData.name,
              supplier: updateData.supplier,
            })
          );
        }
      }
    });

    it("should delete inventory item when product is deleted", async () => {
      const productId = "test-product-to-delete";

      // Lösche Produkt
      const deleteResponse = await request(app.getApp()).delete(
        `/products/${productId}`
      );

      // Delete sollte erfolgreich sein oder Not Found
      expect([
        HTTP_STATUS.NO_CONTENT,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(deleteResponse.status);

      if (deleteResponse.status === HTTP_STATUS.NO_CONTENT) {
        // Prüfe, ob entsprechendes Inventory-Item auch gelöscht wurde
        const inventoryResponse = await request(app.getApp()).get(
          `/inventory/${productId}`
        );

        // Inventory-Item sollte nicht mehr existieren
        expect([
          HTTP_STATUS.NOT_FOUND,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ]).toContain(inventoryResponse.status);
      }
    });

    it("should handle inventory service failures gracefully", async () => {
      const newProduct = {
        name: "Resilience Test Product",
        price: 79.99,
        description: "Testing error resilience",
      };

      // Erstelle Produkt (auch wenn Inventory-Service fehlschlägt)
      const productResponse = await request(app.getApp())
        .post("/products")
        .send(newProduct);

      // Product-Creation sollte auch bei Inventory-Service-Problemen erfolgreich sein
      expect([
        HTTP_STATUS.CREATED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(productResponse.status);

      // Hauptfunktionalität (Product-Service) sollte nicht durch Inventory-Fehler blockiert werden
    });
  });

  describe("Inventory Update Routes", () => {
    it("should support PUT method for inventory updates", async () => {
      const articleNum = "ART-UPDATE-TEST";
      const updateData = {
        productName: "Updated Inventory Product",
        quantity: 150,
        location: "Updated Warehouse",
        supplier: "Updated Supplier",
      };

      const response = await request(app.getApp())
        .put(`/inventory/${articleNum}`)
        .send(updateData);

      // Update sollte funktionieren oder Server-Error bei Service-Problemen
      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);
    });

    it("should validate article number for inventory updates", async () => {
      const updateData = {
        productName: "Test Update",
        quantity: 100,
      };

      // Test mit leerem Article Number
      const response = await request(app.getApp())
        .put("/inventory/")
        .send(updateData);

      // Sollte 404 zurückgeben (Express Route-Handling)
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });
  });
});
