import { response } from "express";
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
  private static instance: InventorySyncHandler | null = null;

  // Bound Methoden für konsistente Referenzen
  private boundHandleProductCreated: (
    event: ProductCreatedEvent,
  ) => Promise<void>;
  private boundHandleProductUpdated: (
    event: ProductUpdatedEvent,
  ) => Promise<void>;
  private boundHandleProductDeleted: (
    event: ProductDeletedEvent,
  ) => Promise<void>;

  constructor(inventoryService?: InventoryService) {
    if (InventorySyncHandler.instance) {
      console.error("❌ MEHRFACHE INSTANZIIERUNG VERHINDERT!");
      throw new Error(
        "InventorySyncHandler ist ein Singleton. Verwende getInstance()",
      );
    }

    console.log("🔧 InventorySyncHandler wird erstellt...");
    this.eventBus = ServiceEventBus.getInstance();
    this.inventoryService = inventoryService || new InventoryService();

    // Bound-Methoden erstellen für konsistente Referenzen
    this.boundHandleProductCreated = this.handleProductCreated.bind(this);
    this.boundHandleProductUpdated = this.handleProductUpdated.bind(this);
    this.boundHandleProductDeleted = this.handleProductDeleted.bind(this);

    this.registerEventHandlers();

    InventorySyncHandler.instance = this;
    console.log("✅ InventorySyncHandler erfolgreich erstellt");
  }

  // Singleton-Pattern um mehrfache Instanziierung zu verhindern
  public static getInstance(
    inventoryService?: InventoryService,
  ): InventorySyncHandler {
    if (!InventorySyncHandler.instance) {
      console.log("🆕 Erstelle neue InventorySyncHandler Instanz");
      InventorySyncHandler.instance = new InventorySyncHandler(
        inventoryService,
      );
    } else {
      console.log("♻️ Verwende bestehende InventorySyncHandler Instanz");
    }
    return InventorySyncHandler.instance;
  }

  // Cleanup-Methode für Tests
  public static resetInstance(): void {
    if (InventorySyncHandler.instance) {
      InventorySyncHandler.instance.cleanup();
      InventorySyncHandler.instance = null;
    }
  }

  private cleanup(): void {
    this.eventBus.removeListener(
      "product.created",
      this.boundHandleProductCreated,
    );
    this.eventBus.removeListener(
      "product.updated",
      this.boundHandleProductUpdated,
    );
    this.eventBus.removeListener(
      "product.deleted",
      this.boundHandleProductDeleted,
    );
    console.log("🧹 Event-Listener entfernt");
  }

  private registerEventHandlers(): void {
    // ALLES ENTFERNEN - KOMPLETT SAUBER MACHEN
    this.eventBus.removeAllListeners("product.created");
    this.eventBus.removeAllListeners("product.updated");
    this.eventBus.removeAllListeners("product.deleted");

    console.log("🧹 ALLE LISTENER ENTFERNT!");

    // NUR EINMAL REGISTRIEREN
    this.eventBus.on("product.created", this.boundHandleProductCreated);
    this.eventBus.on("product.updated", this.boundHandleProductUpdated);
    this.eventBus.on("product.deleted", this.boundHandleProductDeleted);

    console.log(
      `📋 InventorySyncHandler registered. Active listeners: ${this.eventBus.listenerCount(
        "product.created",
      )}`,
    );
  }

  private async handleProductCreated(
    event: ProductCreatedEvent,
  ): Promise<void> {
    console.log(
      "🔥🔥🔥 HANDLER WIRD AUSGEFÜHRT FÜR:",
      event.productId,
      "🔥🔥🔥",
    );

    if (event.inventorySynced) {
      return;
    }

    // Event-Validierung
    if (!event.productId || !event.productData?.name) {
      console.error("❌ Invalid product.created event:", event);
      return;
    }

    // KEIN RETRY - NUR EINMAL VERSUCHEN
    try {
      try {
        await this.inventoryService.getByArticleNum(event.productId);
        console.log(
          `ℹ️ Inventory already exists for product ${event.productId}. Skipping create.`,
        );
        return;
      } catch (existingError) {
        // Not found - proceed with creation
      }

      const inventoryItem = {
        productId: event.productId,
        articleNum: event.productId,
        articleNumber: event.productId,
        name: event.productData.name,
        quantity: 0, // Initial-Bestand
        location: "Main Warehouse",
        supplier: event.productData.supplier || "Default Supplier",
      };

      console.log("📤 Erstelle Inventory Item:", inventoryItem);
      await this.inventoryService.create(inventoryItem);
      console.log(`✅ Inventory item created for product ${event.productId}`);
    } catch (error) {
      console.error(
        `❌ Failed to create inventory item for product ${event.productId}:`,
        error,
      );
      // Event in Dead-Letter-Queue einreihen
      await this.handleFailedEvent("product.created", event, error as Error);
    }
  }

  private async handleProductUpdated(
    event: ProductUpdatedEvent,
  ): Promise<void> {
    try {
      const inventoryUpdate: any = {};

      if (event.productData.name) {
        inventoryUpdate.name = event.productData.name; // ✅ Korrigiert
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
        error,
      );
    }
  }

  private async handleProductDeleted(
    event: ProductDeletedEvent,
  ): Promise<void> {
    try {
      await this.inventoryService.delete(event.productId);
      console.log(`✅ Inventory item deleted for product ${event.productId}`);
    } catch (error) {
      console.error(
        `❌ Failed to delete inventory item for product ${event.productId}:`,
        error,
      );
    }
  }

  /**
   * Hilfsmethode für Retry-Delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Behandelt fehlgeschlagene Events (Dead-Letter-Queue Pattern)
   */
  private async handleFailedEvent(
    eventType: string,
    event: any,
    error: Error,
  ): Promise<void> {
    // Hier könnte man das Event in eine Warteschlange für spätere Verarbeitung einreihen
    console.error(`📋 Adding ${eventType} event to dead-letter-queue:`, {
      event,
      error: error.message,
    });

    // TODO: Implementierung einer echten Dead-Letter-Queue
    // z.B. Redis, Database, oder Message Queue System
  }

  /**
   * Graceful Shutdown - Event-Listener entfernen
   * @deprecated Verwende InventorySyncHandler.resetInstance() für saubere Singleton-Behandlung
   */
  destroy(): void {
    this.cleanup();
  }
}
