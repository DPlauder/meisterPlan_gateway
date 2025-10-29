import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import { ProductsRoutes } from "../../src/routes/ProductsRoutes";
import { ProductsService } from "../../src/services/ProductsService";
import { ServiceEventBus } from "../../src/events/ServiceEventBus";

// Mock dependencies
jest.mock("../../src/services/ProductsService");
jest.mock("../../src/events/ServiceEventBus");

describe("ProductsRoutes", () => {
  let app: express.Application;
  let mockProductsService: jest.Mocked<ProductsService>;
  let mockEventBus: jest.Mocked<ServiceEventBus>;

  beforeEach(() => {
    mockProductsService = new ProductsService() as jest.Mocked<ProductsService>;

    // Mock EventBus singleton
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;

    (ServiceEventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);

    app = express();
    app.use(express.json());

    const productsRoutes = new ProductsRoutes();
    app.use("/products", productsRoutes.router);

    jest.clearAllMocks();
  });

  describe("POST /products", () => {
    it("should create product and emit product.created event", async () => {
      const newProduct = {
        name: "New Product",
        price: 199.99,
        supplier: "Test Supplier",
      };

      const createdProduct = {
        id: "PROD-123",
        ...newProduct,
        createdAt: new Date().toISOString(),
      };

      mockProductsService.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post("/products")
        .send(newProduct)
        .expect(201);

      expect(response.body).toEqual(createdProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(newProduct);

      expect(mockEventBus.emit).toHaveBeenCalledWith("product.created", {
        productId: "PROD-123",
        productData: newProduct,
        timestamp: expect.any(Date),
      });
    });

    it("should handle service errors without emitting events", async () => {
      const newProduct = {
        name: "Error Product",
        price: 99.99,
      };

      mockProductsService.create.mockRejectedValue(new Error("Service error"));

      await request(app).post("/products").send(newProduct).expect(500);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      await request(app)
        .post("/products")
        .send({}) // Kein name
        .expect(400);

      expect(mockProductsService.create).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("PUT /products/:id", () => {
    it("should update product and emit product.updated event", async () => {
      const productId = "PROD-456";
      const updateData = {
        name: "Updated Product",
        price: 299.99,
      };

      const updatedProduct = {
        id: productId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateData
      );

      expect(mockEventBus.emit).toHaveBeenCalledWith("product.updated", {
        productId: productId,
        productData: updateData,
        timestamp: expect.any(Date),
      });
    });

    it("should handle update service errors", async () => {
      const productId = "PROD-ERROR";
      const updateData = { name: "Error Update" };

      mockProductsService.update.mockRejectedValue(new Error("Update failed"));

      await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(500);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete product and emit product.deleted event", async () => {
      const productId = "PROD-DELETE";

      mockProductsService.delete.mockResolvedValue(true);

      await request(app).delete(`/products/${productId}`).expect(204);

      expect(mockProductsService.delete).toHaveBeenCalledWith(productId);

      expect(mockEventBus.emit).toHaveBeenCalledWith("product.deleted", {
        productId: productId,
        timestamp: expect.any(Date),
      });
    });

    it("should handle delete service errors", async () => {
      const productId = "PROD-DELETE-ERROR";

      mockProductsService.delete.mockRejectedValue(new Error("Delete failed"));

      await request(app).delete(`/products/${productId}`).expect(500);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it("should handle product not found", async () => {
      const productId = "PROD-NOT-FOUND";

      mockProductsService.delete.mockResolvedValue(false);

      await request(app).delete(`/products/${productId}`).expect(404);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("GET /products", () => {
    it("should get all products without emitting events", async () => {
      const mockProducts = [
        { id: "PROD-1", name: "Product 1", price: 100 },
        { id: "PROD-2", name: "Product 2", price: 200 },
      ];

      mockProductsService.getAll.mockResolvedValue(mockProducts);

      const response = await request(app).get("/products").expect(200);

      expect(response.body).toEqual(mockProducts);
      expect(mockProductsService.getAll).toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("GET /products/:id", () => {
    it("should get single product without emitting events", async () => {
      const productId = "PROD-SINGLE";
      const mockProduct = {
        id: productId,
        name: "Single Product",
        price: 150,
      };

      mockProductsService.getById.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockProductsService.getById).toHaveBeenCalledWith(productId);
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it("should handle product not found", async () => {
      const productId = "PROD-NOT-FOUND";

      mockProductsService.getById.mockResolvedValue(null);

      await request(app).get(`/products/${productId}`).expect(404);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe("Event Bus Integration", () => {
    it("should use EventBus singleton", async () => {
      expect(ServiceEventBus.getInstance).toHaveBeenCalled();
    });

    it("should emit events with correct timestamps", async () => {
      const beforeTime = Date.now();
      const newProduct = { name: "Timestamp Test", price: 100 };
      const createdProduct = { id: "PROD-TIME", ...newProduct };

      mockProductsService.create.mockResolvedValue(createdProduct);

      await request(app).post("/products").send(newProduct).expect(201);

      const emitCall = mockEventBus.emit.mock.calls[0];
      expect(emitCall).toBeDefined();
      const eventData = emitCall![1] as any;
      const afterTime = Date.now();

      expect(eventData.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(eventData.timestamp.getTime()).toBeLessThanOrEqual(afterTime);
    });
  });
});
