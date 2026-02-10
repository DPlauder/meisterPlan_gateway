import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { InventorySyncHandler } from "../../src/handlers/InventorySyncHandler";
import { ServiceEventBus } from "../../src/events/ServiceEventBus";
import { InventoryService } from "../../src/services/InventoryService";

// Mock InventoryService
jest.mock("../../src/services/InventoryService");

describe("InventorySyncHandler", () => {
  let inventorySyncHandler: InventorySyncHandler;
  let mockInventoryService: jest.Mocked<InventoryService>;
  let eventBus: ServiceEventBus;

  beforeEach(() => {
    // EventBus-Singleton zurücksetzen für jeden Test
    (ServiceEventBus as any).instance = undefined;
    // InventorySyncHandler-Singleton zurücksetzen
    InventorySyncHandler.resetInstance();

    eventBus = ServiceEventBus.getInstance();
    mockInventoryService =
      new InventoryService() as jest.Mocked<InventoryService>;
    inventorySyncHandler =
      InventorySyncHandler.getInstance(mockInventoryService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    InventorySyncHandler.resetInstance();
  });

  describe("Product Created Events", () => {
    it("should create inventory item when product is created", async () => {
      mockInventoryService.create.mockResolvedValue({ success: true });

      const productCreatedEvent = {
        productId: "PROD-123",
        productData: {
          name: "Test Product",
          price: 99.99,
          supplier: "Test Supplier",
        },
        timestamp: new Date(),
      };

      eventBus.emit("product.created", productCreatedEvent);

      // Event-Handler ist async, kurz warten
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockInventoryService.create).toHaveBeenCalledWith({
        articleNum: "PROD-123",
        productName: "Test Product",
        quantity: 0,
        location: "Main Warehouse",
        supplier: "Test Supplier",
      });
    });

    it("should handle inventory service errors gracefully", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockInventoryService.create.mockRejectedValue(
        new Error("Inventory service down")
      );

      const productCreatedEvent = {
        productId: "PROD-456",
        productData: {
          name: "Error Test Product",
          supplier: "Error Supplier",
        },
        timestamp: new Date(),
      };

      eventBus.emit("product.created", productCreatedEvent);
      // Längeres Warten wegen Retry-Logik (3 Versuche mit Delays)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Failed to create inventory item for product PROD-456"
        ),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Product Updated Events", () => {
    it("should update inventory item when product is updated", async () => {
      mockInventoryService.update.mockResolvedValue({ success: true });

      const productUpdatedEvent = {
        productId: "PROD-789",
        productData: {
          name: "Updated Product Name",
          supplier: "Updated Supplier",
        },
        timestamp: new Date(),
      };

      eventBus.emit("product.updated", productUpdatedEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockInventoryService.update).toHaveBeenCalledWith("PROD-789", {
        productName: "Updated Product Name",
        supplier: "Updated Supplier",
      });
    });

    it("should not update inventory if no relevant fields changed", async () => {
      const productUpdatedEvent = {
        productId: "PROD-999",
        productData: {
          price: 199.99, // Nur Preis geändert, nicht relevant für Inventory
        },
        timestamp: new Date(),
      };

      eventBus.emit("product.updated", productUpdatedEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockInventoryService.update).not.toHaveBeenCalled();
    });
  });

  describe("Product Deleted Events", () => {
    it("should delete inventory item when product is deleted", async () => {
      mockInventoryService.delete.mockResolvedValue(true);

      const productDeletedEvent = {
        productId: "PROD-DELETE",
        timestamp: new Date(),
      };

      eventBus.emit("product.deleted", productDeletedEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockInventoryService.delete).toHaveBeenCalledWith("PROD-DELETE");
    });
  });

  describe("Event Bus Integration", () => {
    it("should use singleton EventBus instance", () => {
      const eventBus1 = ServiceEventBus.getInstance();
      const eventBus2 = ServiceEventBus.getInstance();

      expect(eventBus1).toBe(eventBus2); // Sollten dieselbe Instanz sein
    });

    it("should properly clean up event listeners on resetInstance", () => {
      const removeListenerSpy = jest.spyOn(eventBus, "removeListener");

      InventorySyncHandler.resetInstance();

      expect(removeListenerSpy).toHaveBeenCalledTimes(3);
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "product.created",
        expect.any(Function)
      );
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "product.updated",
        expect.any(Function)
      );
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "product.deleted",
        expect.any(Function)
      );
    });
  });
});
