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
    eventBus = ServiceEventBus.getInstance();

    mockInventoryService =
      new InventoryService() as jest.Mocked<InventoryService>;
    inventorySyncHandler = new InventorySyncHandler(mockInventoryService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    inventorySyncHandler.destroy();
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
      await new Promise((resolve) => setTimeout(resolve, 10));

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

    it("should properly clean up event listeners on destroy", () => {
      const removeAllListenersSpy = jest.spyOn(eventBus, "removeAllListeners");

      inventorySyncHandler.destroy();

      expect(removeAllListenersSpy).toHaveBeenCalledWith("product.created");
      expect(removeAllListenersSpy).toHaveBeenCalledWith("product.updated");
      expect(removeAllListenersSpy).toHaveBeenCalledWith("product.deleted");
    });
  });
});
