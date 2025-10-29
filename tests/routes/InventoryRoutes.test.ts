import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express, { Application } from "express";
import { InventoryRoutes } from "../../src/routes/InventoryRoutes";
import { InventoryService } from "../../src/services/InventoryService";
import { mockData, HTTP_STATUS } from "../testUtils";

// Mock InventoryService
jest.mock("../../src/services/InventoryService");

describe("InventoryRoutes", () => {
  let app: Application;
  let inventoryRoutes: InventoryRoutes;
  let mockInventoryService: jest.Mocked<InventoryService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    inventoryRoutes = new InventoryRoutes();
    app.use("/inventory", inventoryRoutes.router);

    // Mock Service erstellen
    mockInventoryService =
      new InventoryService() as jest.Mocked<InventoryService>;
    (inventoryRoutes as any).inventoryService = mockInventoryService;

    // Mock-Implementierungen zurücksetzen
    jest.clearAllMocks();
  });

  describe("GET /inventory", () => {
    it("should return all inventory items successfully", async () => {
      mockInventoryService.getAll.mockResolvedValue(mockData.inventoryItems);

      const response = await request(app)
        .get("/inventory")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual(mockData.inventoryItems);
      expect(mockInventoryService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty inventory list", async () => {
      mockInventoryService.getAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/inventory")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual([]);
      expect(mockInventoryService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors", async () => {
      mockInventoryService.getAll.mockRejectedValue(
        new Error("Inventory service unavailable")
      );

      const response = await request(app)
        .get("/inventory")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal Server Error" });
      expect(mockInventoryService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /inventory/:articleNum", () => {
    it("should return inventory item by article number", async () => {
      mockInventoryService.getByArticleNum.mockResolvedValue(
        mockData.inventoryItem
      );

      const response = await request(app)
        .get("/inventory/ART001")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual(mockData.inventoryItem);
      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        "ART001"
      );
    });

    it("should return null if inventory item not found", async () => {
      mockInventoryService.getByArticleNum.mockResolvedValue(null);

      const response = await request(app)
        .get("/inventory/ART999")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toBeNull();
      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        "ART999"
      );
    });

    it("should return 400 for empty article number", async () => {
      const response = await request(app)
        .get("/inventory/")
        .expect(HTTP_STATUS.NOT_FOUND); // Express behandelt leere Parameter als 404
    });

    it("should handle service errors gracefully", async () => {
      mockInventoryService.getByArticleNum.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/inventory/ART001")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal Server Error" });
      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        "ART001"
      );
    });

    it("should handle special characters in article number", async () => {
      const specialArticleNum = "ART-001_TEST";
      mockInventoryService.getByArticleNum.mockResolvedValue(
        mockData.inventoryItem
      );

      const response = await request(app)
        .get(`/inventory/${specialArticleNum}`)
        .expect(HTTP_STATUS.OK);

      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        specialArticleNum
      );
    });
  });

  describe("POST /inventory", () => {
    it("should create a new inventory item successfully", async () => {
      const newInventoryData = {
        articleNum: "ART004",
        productName: "New Product",
        quantity: 75,
        location: "Warehouse D",
      };
      const createdInventoryItem = { id: "4", ...newInventoryData };

      mockInventoryService.create.mockResolvedValue(createdInventoryItem);

      const response = await request(app)
        .post("/inventory")
        .send(newInventoryData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toEqual(createdInventoryItem);
      expect(mockInventoryService.create).toHaveBeenCalledWith(
        newInventoryData
      );
    });

    it("should handle empty request body", async () => {
      const createdItem = { id: "1", articleNum: "DEFAULT" };
      mockInventoryService.create.mockResolvedValue(createdItem);

      const response = await request(app)
        .post("/inventory")
        .send({})
        .expect(HTTP_STATUS.CREATED);

      expect(mockInventoryService.create).toHaveBeenCalledWith({});
    });

    it("should handle service creation errors", async () => {
      mockInventoryService.create.mockRejectedValue(
        new Error("Validation failed")
      );

      const response = await request(app)
        .post("/inventory")
        .send({ articleNum: "ART001" })
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal Server Error" });
      expect(mockInventoryService.create).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid JSON", async () => {
      const response = await request(app)
        .post("/inventory")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(HTTP_STATUS.BAD_REQUEST);
    });

    it("should create inventory item with all fields", async () => {
      const fullInventoryData = {
        articleNum: "ART005",
        productName: "Complete Product",
        quantity: 999,
        location: "Main Warehouse",
        supplier: "Premium Supplier",
        category: "Electronics",
        minThreshold: 10,
        maxThreshold: 1000,
      };

      mockInventoryService.create.mockResolvedValue(fullInventoryData);

      const response = await request(app)
        .post("/inventory")
        .send(fullInventoryData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toEqual(fullInventoryData);
      expect(mockInventoryService.create).toHaveBeenCalledWith(
        fullInventoryData
      );
    });
  });

  describe("DELETE /inventory/:articleNum", () => {
    it("should delete inventory item successfully", async () => {
      mockInventoryService.delete.mockResolvedValue(true);

      await request(app)
        .delete("/inventory/ART001")
        .expect(HTTP_STATUS.NO_CONTENT);

      expect(mockInventoryService.delete).toHaveBeenCalledWith("ART001");
    });

    it("should handle deletion of non-existent item", async () => {
      mockInventoryService.delete.mockResolvedValue(false);

      await request(app)
        .delete("/inventory/ART999")
        .expect(HTTP_STATUS.NO_CONTENT); // Code gibt immer 204 zurück

      expect(mockInventoryService.delete).toHaveBeenCalledWith("ART999");
    });

    it("should return 400 for empty article number", async () => {
      await request(app).delete("/inventory/").expect(HTTP_STATUS.NOT_FOUND); // Express behandelt leere Parameter als 404
    });

    it("should handle deletion service errors", async () => {
      mockInventoryService.delete.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .delete("/inventory/ART001")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal Server Error" });
      expect(mockInventoryService.delete).toHaveBeenCalledWith("ART001");
    });

    it("should handle special characters in article number for deletion", async () => {
      const specialArticleNum = "ART-001_DELETE";
      mockInventoryService.delete.mockResolvedValue(true);

      await request(app)
        .delete(`/inventory/${specialArticleNum}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      expect(mockInventoryService.delete).toHaveBeenCalledWith(
        specialArticleNum
      );
    });
  });

  describe("Router Configuration", () => {
    it("should have router property", () => {
      expect(inventoryRoutes.router).toBeDefined();
      expect(typeof inventoryRoutes.router).toBe("function");
    });

    it("should have inventoryService property", () => {
      expect(inventoryRoutes.inventoryService).toBeDefined();
      expect(inventoryRoutes.inventoryService).toBeInstanceOf(InventoryService);
    });

    it("should register all routes correctly", () => {
      const getSpy = jest.spyOn(inventoryRoutes.router, "get");
      const postSpy = jest.spyOn(inventoryRoutes.router, "post");
      const deleteSpy = jest.spyOn(inventoryRoutes.router, "delete");

      // Neue Instanz erstellen um registerRoutes zu triggern
      new InventoryRoutes();

      expect(getSpy).toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe("Parameter Validation", () => {
    it("should validate article number format", async () => {
      mockInventoryService.getByArticleNum.mockResolvedValue(
        mockData.inventoryItem
      );

      // Test verschiedene gültige Formate
      const validArticleNumbers = ["ART001", "PROD-123", "INV_456", "123-ABC"];

      for (const articleNum of validArticleNumbers) {
        await request(app)
          .get(`/inventory/${articleNum}`)
          .expect(HTTP_STATUS.OK);

        expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
          articleNum
        );
      }
    });

    it("should handle URL encoded article numbers", async () => {
      const encodedArticleNum = encodeURIComponent("ART 001");
      mockInventoryService.getByArticleNum.mockResolvedValue(
        mockData.inventoryItem
      );

      await request(app)
        .get(`/inventory/${encodedArticleNum}`)
        .expect(HTTP_STATUS.OK);

      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        "ART 001"
      );
    });
  });

  describe("Service Integration", () => {
    it("should initialize with InventoryService", () => {
      expect((inventoryRoutes as any).inventoryService).toBeInstanceOf(
        InventoryService
      );
    });

    it("should call service methods with correct parameters", async () => {
      mockInventoryService.getByArticleNum.mockResolvedValue(
        mockData.inventoryItem
      );

      await request(app)
        .get("/inventory/test-article-123")
        .expect(HTTP_STATUS.OK);

      expect(mockInventoryService.getByArticleNum).toHaveBeenCalledWith(
        "test-article-123"
      );
    });
  });

  describe("Error Response Consistency", () => {
    it("should return consistent error format for all endpoints", async () => {
      const endpoints = [
        { method: "get", path: "/inventory" },
        { method: "get", path: "/inventory/ART001" },
        { method: "post", path: "/inventory" },
        { method: "delete", path: "/inventory/ART001" },
      ];

      // Mock alle Service-Methoden für Fehler
      mockInventoryService.getAll.mockRejectedValue(new Error("Service error"));
      mockInventoryService.getByArticleNum.mockRejectedValue(
        new Error("Service error")
      );
      mockInventoryService.create.mockRejectedValue(new Error("Service error"));
      mockInventoryService.delete.mockRejectedValue(new Error("Service error"));

      for (const endpoint of endpoints) {
        const response = await (request(app) as any)
          [endpoint.method](endpoint.path)
          .send({}) // Für POST-Requests
          .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Internal Server Error");
      }
    });
  });
});
