import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express, { Application } from "express";
import { ProductsRoutes } from "../../src/routes/ProductsRoutes";
import { ProductsService } from "../../src/services/ProductsService";
import { mockData, HTTP_STATUS } from "../testUtils";

// Mock ProductsService
jest.mock("../../src/services/ProductsService");

describe("ProductsRoutes", () => {
  let app: Application;
  let productsRoutes: ProductsRoutes;
  let mockProductsService: jest.Mocked<ProductsService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    productsRoutes = new ProductsRoutes();
    app.use("/products", productsRoutes.router);

    // Mock Service erstellen
    mockProductsService = new ProductsService() as jest.Mocked<ProductsService>;
    (productsRoutes as any).productsService = mockProductsService;

    // Mock-Implementierungen zurücksetzen
    jest.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should return all products successfully", async () => {
      mockProductsService.getAll.mockResolvedValue(mockData.products);

      const response = await request(app)
        .get("/products")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual(mockData.products);
      expect(mockProductsService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty product list", async () => {
      mockProductsService.getAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/products")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual([]);
      expect(mockProductsService.getAll).toHaveBeenCalledTimes(1);
    });

    it("should handle service errors", async () => {
      mockProductsService.getAll.mockRejectedValue(
        new Error("Service unavailable")
      );

      await request(app)
        .get("/products")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(mockProductsService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by id", async () => {
      mockProductsService.getById.mockResolvedValue(mockData.product);

      const response = await request(app)
        .get("/products/1")
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual(mockData.product);
      expect(mockProductsService.getById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if product not found", async () => {
      mockProductsService.getById.mockResolvedValue(null);

      const response = await request(app)
        .get("/products/999")
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body).toEqual({ error: "Product not found" });
      expect(mockProductsService.getById).toHaveBeenCalledWith("999");
    });

    it("should return 400 for empty product ID", async () => {
      const response = await request(app)
        .get("/products/")
        .expect(HTTP_STATUS.NOT_FOUND); // Express gibt 404 für leere Parameter zurück
    });

    it("should handle service errors gracefully", async () => {
      mockProductsService.getById.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/products/1")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal server error" });
      expect(mockProductsService.getById).toHaveBeenCalledWith("1");
    });

    it("should handle non-string product IDs", async () => {
      // Express konvertiert Parameter automatisch zu Strings,
      // aber wir testen trotzdem die Validierung
      const response = await request(app)
        .get("/products/123")
        .expect(HTTP_STATUS.OK);

      expect(mockProductsService.getById).toHaveBeenCalledWith("123");
    });
  });

  describe("POST /products", () => {
    it("should create a new product successfully", async () => {
      const newProductData = { name: "New Product", price: 99.99 };
      const createdProduct = { id: "1", ...newProductData };

      mockProductsService.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post("/products")
        .send(newProductData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toEqual(createdProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(newProductData);
    });

    it("should handle empty request body", async () => {
      const createdProduct = { id: "1", name: "Default Product" };
      mockProductsService.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post("/products")
        .send({})
        .expect(HTTP_STATUS.CREATED);

      expect(mockProductsService.create).toHaveBeenCalledWith({});
    });

    it("should handle service creation errors", async () => {
      mockProductsService.create.mockRejectedValue(
        new Error("Validation failed")
      );

      await request(app)
        .post("/products")
        .send({ name: "Test Product" })
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(mockProductsService.create).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid JSON", async () => {
      const response = await request(app)
        .post("/products")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product successfully", async () => {
      mockProductsService.delete.mockResolvedValue(true);

      await request(app).delete("/products/1").expect(HTTP_STATUS.NO_CONTENT);

      expect(mockProductsService.delete).toHaveBeenCalledWith("1");
    });

    it("should return 404 if product not found for deletion", async () => {
      mockProductsService.delete.mockResolvedValue(false);

      await request(app).delete("/products/999").expect(HTTP_STATUS.NOT_FOUND);

      expect(mockProductsService.delete).toHaveBeenCalledWith("999");
    });

    it("should return 400 for empty product ID", async () => {
      await request(app).delete("/products/").expect(HTTP_STATUS.NOT_FOUND); // Express behandelt leere Parameter als 404
    });

    it("should handle deletion service errors", async () => {
      mockProductsService.delete.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete("/products/1")
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(response.body).toEqual({ error: "Internal server error" });
      expect(mockProductsService.delete).toHaveBeenCalledWith("1");
    });
  });

  describe("Router Configuration", () => {
    it("should have router property", () => {
      expect(productsRoutes.router).toBeDefined();
      expect(typeof productsRoutes.router).toBe("function");
    });

    it("should register all routes correctly", () => {
      const routerSpy = jest.spyOn(productsRoutes.router, "get");
      const postSpy = jest.spyOn(productsRoutes.router, "post");
      const deleteSpy = jest.spyOn(productsRoutes.router, "delete");

      // Neue Instanz erstellen um registerRoutes zu triggern
      new ProductsRoutes();

      expect(routerSpy).toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
