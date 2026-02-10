import { EventEmitter } from "events";

/**
 * Event-basierte Service-Kommunikation für lose Kopplung
 */
export class ServiceEventBus extends EventEmitter {
  private static instance: ServiceEventBus;

  static getInstance(): ServiceEventBus {
    if (!ServiceEventBus.instance) {
      console.log("🔄 Erstelle neue ServiceEventBus Instanz");
      ServiceEventBus.instance = new ServiceEventBus();
    } else {
      console.log("♻️ Verwende bestehende ServiceEventBus Instanz");
    }
    return ServiceEventBus.instance;
  }

  // Event-Types für Type-Safety
  emit(event: "product.created", data: ProductCreatedEvent): boolean;
  emit(event: "product.updated", data: ProductUpdatedEvent): boolean;
  emit(event: "product.deleted", data: ProductDeletedEvent): boolean;
  emit(event: string, ...args: any[]): boolean {
    if (event.startsWith("product.")) {
      console.log(
        `📤 Event emittiert: ${event}, Listener: ${this.listenerCount(event)}`
      );
    }
    return super.emit(event, ...args);
  }

  on(
    event: "product.created",
    listener: (data: ProductCreatedEvent) => void
  ): this;
  on(
    event: "product.updated",
    listener: (data: ProductUpdatedEvent) => void
  ): this;
  on(
    event: "product.deleted",
    listener: (data: ProductDeletedEvent) => void
  ): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

// Event-Datenstrukturen
export interface ProductCreatedEvent {
  productId: string;
  productData: {
    name: string;
    price?: number;
    description?: string;
    supplier?: string;
  };
  timestamp: Date;
}

export interface ProductUpdatedEvent {
  productId: string;
  productData: {
    name?: string;
    price?: number;
    description?: string;
    supplier?: string;
  };
  timestamp: Date;
}

export interface ProductDeletedEvent {
  productId: string;
  timestamp: Date;
}
