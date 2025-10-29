import {
  ServiceEventBus,
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
} from "../events/ServiceEventBus";
import { InventoryService } from "../services/InventoryService";

/**
 * Event-Handler für Inventory-Synchronisation
 * Entkoppelt von ProductsRoutes - folgt Single Responsibility Principle
 */
export class InventorySyncHandler {
  private eventBus: ServiceEventBus;
  private inventoryService: InventoryService;

  constructor(inventoryService?: InventoryService) {
    this.eventBus = ServiceEventBus.getInstance();
    this.inventoryService = inventoryService || new InventoryService();
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.eventBus.on("product.created", this.handleProductCreated.bind(this));
    this.eventBus.on("product.updated", this.handleProductUpdated.bind(this));
    this.eventBus.on("product.deleted", this.handleProductDeleted.bind(this));
  }

  private async handleProductCreated(
    event: ProductCreatedEvent
  ): Promise<void> {
    try {
      const inventoryItem = {
        articleNum: event.productId,
        productName: event.productData.name,
        quantity: 0, // Initial-Bestand
        location: "Main Warehouse",
        supplier: event.productData.supplier || "Default Supplier",
      };

      await this.inventoryService.create(inventoryItem);
      console.log(`✅ Inventory item created for product ${event.productId}`);
    } catch (error) {
      console.error(
        `❌ Failed to create inventory item for product ${event.productId}:`,
        error
      );
      // Hier könnte man Retry-Logic oder Dead-Letter-Queue implementieren
    }
  }

  private async handleProductUpdated(
    event: ProductUpdatedEvent
  ): Promise<void> {
    try {
      const inventoryUpdate: any = {};

      if (event.productData.name) {
        inventoryUpdate.productName = event.productData.name;
      }

      if (event.productData.supplier) {
        inventoryUpdate.supplier = event.productData.supplier;
      }

      // Nur updaten wenn tatsächlich relevante Änderungen vorliegen
      if (Object.keys(inventoryUpdate).length > 0) {
        await this.inventoryService.update(event.productId, inventoryUpdate);
        console.log(`✅ Inventory item updated for product ${event.productId}`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to update inventory item for product ${event.productId}:`,
        error
      );
    }
  }

  private async handleProductDeleted(
    event: ProductDeletedEvent
  ): Promise<void> {
    try {
      await this.inventoryService.delete(event.productId);
      console.log(`✅ Inventory item deleted for product ${event.productId}`);
    } catch (error) {
      console.error(
        `❌ Failed to delete inventory item for product ${event.productId}:`,
        error
      );
    }
  }

  /**
   * Graceful Shutdown - Event-Listener entfernen
   */
  destroy(): void {
    this.eventBus.removeAllListeners("product.created");
    this.eventBus.removeAllListeners("product.updated");
    this.eventBus.removeAllListeners("product.deleted");
  }
}
