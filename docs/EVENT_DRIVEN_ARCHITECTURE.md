# 🔄 Event-driven Architecture Documentation

## Überblick

Das MeisterPlan Gateway implementiert eine moderne **Event-driven Architecture** für lose gekoppelte Microservice-Kommunikation. Das System basiert auf dem **ServiceEventBus** als zentralem Event-Dispatcher und spezialisierten **Event-Handlers** für automatische Service-Synchronisation.

## 🏗️ Architektur-Komponenten

### 1. ServiceEventBus (Zentraler Event-Dispatcher)

```typescript
// src/events/ServiceEventBus.ts
export class ServiceEventBus extends EventEmitter {
  private static instance: ServiceEventBus;

  public static getInstance(): ServiceEventBus {
    if (!ServiceEventBus.instance) {
      ServiceEventBus.instance = new ServiceEventBus();
    }
    return ServiceEventBus.instance;
  }

  // Typisierte Event-Emission
  emit(event: "product.created", data: ProductCreatedEvent): boolean;
  emit(event: "product.updated", data: ProductUpdatedEvent): boolean;
  emit(event: "product.deleted", data: ProductDeletedEvent): boolean;
}
```

**Features:**

- ✅ **Singleton-Pattern** für globale Event-Koordination
- ✅ **TypeScript-typisiert** für Event-Safety
- ✅ **EventEmitter-basiert** für Node.js-Performance
- ✅ **Memory-Leak-Schutz** durch Listener-Management

### 2. Event-Definitionen

```typescript
// Event-Types für typisierte Kommunikation
interface ProductCreatedEvent {
  productId: string;
  productData: {
    name: string;
    price?: number;
    description?: string;
    supplier?: string;
  };
  timestamp: Date;
}

interface ProductUpdatedEvent {
  productId: string;
  productData: {
    name?: string;
    price?: number;
    description?: string;
    supplier?: string;
  };
  timestamp: Date;
}

interface ProductDeletedEvent {
  productId: string;
  timestamp: Date;
}
```

### 3. InventorySyncHandler (Event-Handler)

```typescript
// src/handlers/InventorySyncHandler.ts
export class InventorySyncHandler {
  constructor(private inventoryService: InventoryService) {
    const eventBus = ServiceEventBus.getInstance();

    // Event-Listener registrieren
    eventBus.on("product.created", this.handleProductCreated.bind(this));
    eventBus.on("product.updated", this.handleProductUpdated.bind(this));
    eventBus.on("product.deleted", this.handleProductDeleted.bind(this));
  }

  private async handleProductCreated(event: ProductCreatedEvent) {
    try {
      await this.inventoryService.create({
        articleNum: event.productId,
        productName: event.productData.name,
        quantity: 0,
        location: "Main Warehouse",
        supplier: event.productData.supplier,
      });
      console.log(`✅ Inventory item created for product ${event.productId}`);
    } catch (error) {
      console.error(
        `Failed to create inventory item for product ${event.productId}:`,
        error
      );
    }
  }

  // Cleanup-Methode für Tests
  public destroy(): void {
    const eventBus = ServiceEventBus.getInstance();
    eventBus.removeAllListeners("product.created");
    eventBus.removeAllListeners("product.updated");
    eventBus.removeAllListeners("product.deleted");
  }
}
```

### 4. Event-driven ProductsRoutes

```typescript
// src/routes/ProductsRoutes.ts
export class ProductsRoutes {
  private eventBus: ServiceEventBus;

  constructor() {
    this.eventBus = ServiceEventBus.getInstance();
  }

  private async createProduct(req: Request, res: Response) {
    try {
      const newProduct = await this.productsService.create(req.body);

      // Event emittieren für automatische Synchronisation
      this.eventBus.emit("product.created", {
        productId: newProduct.id,
        productData: req.body,
        timestamp: new Date(),
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
```

## 🚀 System-Initialisierung

### App.ts Integration

```typescript
// src/App.ts
export class App {
  private inventorySyncHandler: InventorySyncHandler | undefined;

  constructor() {
    this.initializeEventSystem();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeEventSystem(): void {
    const eventBus = ServiceEventBus.getInstance();
    const inventoryService = new InventoryService();
    this.inventorySyncHandler = new InventorySyncHandler(inventoryService);

    console.log("Event-driven architecture initialized");
  }

  public cleanup(): void {
    if (this.inventorySyncHandler) {
      this.inventorySyncHandler.destroy();
    }
  }
}
```

## 🔄 Event-Flow Diagramm

```
POST /products
       ↓
ProductsRoutes.createProduct()
       ↓
ProductsService.create()
       ↓
EventBus.emit('product.created')
       ↓
InventorySyncHandler.handleProductCreated()
       ↓
InventoryService.create()
       ↓
✅ Inventory item created
```

## 🧪 Testing Strategy

### 1. ServiceEventBus Tests

```typescript
// tests/events/ServiceEventBus.test.ts
describe("ServiceEventBus", () => {
  it("should return the same instance on multiple calls", () => {
    const instance1 = ServiceEventBus.getInstance();
    const instance2 = ServiceEventBus.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should emit and handle product.created events", (done) => {
    eventBus.on("product.created", (event) => {
      expect(event.productId).toBe("TEST-123");
      done();
    });

    eventBus.emit("product.created", testEvent);
  });
});
```

### 2. InventorySyncHandler Tests

```typescript
// tests/handlers/InventorySyncHandler.test.ts
describe("InventorySyncHandler", () => {
  it("should create inventory item when product is created", async () => {
    mockInventoryService.create.mockResolvedValue({ success: true });

    eventBus.emit("product.created", productCreatedEvent);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockInventoryService.create).toHaveBeenCalledWith({
      articleNum: "PROD-123",
      productName: "Test Product",
      quantity: 0,
      location: "Main Warehouse",
    });
  });
});
```

### 3. Event-driven Integration Tests

```typescript
// tests/integration/event-driven.integration.test.ts
describe("Event-driven Integration Tests", () => {
  it("should create product and trigger inventory event", async () => {
    let eventReceived = false;
    eventBus.on("product.created", () => (eventReceived = true));

    const response = await request(app.getApp())
      .post("/products")
      .send(newProduct);

    expect(response.status).toBe(201);
    expect(eventReceived).toBe(true);
  });
});
```

## 📊 Performance & Monitoring

### Event-Metriken

```typescript
// Event-Monitoring implementieren
class EventMetrics {
  private static eventCounts = new Map<string, number>();

  static trackEvent(eventType: string) {
    const count = this.eventCounts.get(eventType) || 0;
    this.eventCounts.set(eventType, count + 1);
  }

  static getMetrics() {
    return Object.fromEntries(this.eventCounts);
  }
}

// In ServiceEventBus integrieren
emit(event: string, data: any): boolean {
  EventMetrics.trackEvent(event);
  return super.emit(event, data);
}
```

### Health-Check für Event-System

```typescript
// GET /health erweitern
{
  "status": "healthy",
  "timestamp": "2025-10-29T10:30:00Z",
  "services": {
    "businessCustomer": "connected",
    "products": "connected",
    "inventory": "connected"
  },
  "eventSystem": {
    "eventBus": "initialized",
    "handlers": {
      "inventorySync": "active"
    },
    "eventMetrics": {
      "product.created": 42,
      "product.updated": 18,
      "product.deleted": 5
    }
  }
}
```

## 🎯 Best Practices

### 1. Event-Handler Design

```typescript
// ✅ Gut: Resiliente Error-Handling
private async handleProductCreated(event: ProductCreatedEvent) {
  try {
    await this.inventoryService.create(inventoryData);
    console.log(`✅ Inventory item created for product ${event.productId}`);
  } catch (error) {
    // Fehler loggen, aber nicht weiterwerfen
    console.error(`Failed to create inventory item:`, error);
  }
}

// ❌ Schlecht: Error wirft und bricht Event-Chain
private async handleProductCreated(event: ProductCreatedEvent) {
  await this.inventoryService.create(inventoryData); // Kann Exception werfen
}
```

### 2. Event-Naming Convention

```typescript
// ✅ Gut: Noun.Verb Format
"product.created";
"product.updated";
"product.deleted";
"inventory.synced";
"order.shipped";

// ❌ Schlecht: Unklare Naming
"productCreate";
"updateProduct";
"inventoryUpdate";
```

### 3. Event-Data Structure

```typescript
// ✅ Gut: Konsistente Event-Struktur
interface BaseEvent {
  timestamp: Date;
}

interface ProductEvent extends BaseEvent {
  productId: string;
  productData?: any;
}

// ❌ Schlecht: Inkonsistente Strukturen
{ productId: "123", data: {...} }  // Kein timestamp
{ id: "456", product: {...}, time: "..." }  // Verschiedene Feldnamen
```

### 4. Memory-Leak Prevention

```typescript
// ✅ Gut: Cleanup-Methoden implementieren
class InventorySyncHandler {
  public destroy(): void {
    const eventBus = ServiceEventBus.getInstance();
    eventBus.removeAllListeners("product.created");
    eventBus.removeAllListeners("product.updated");
    eventBus.removeAllListeners("product.deleted");
  }
}

// In Tests verwenden
afterEach(() => {
  inventorySyncHandler.destroy();
});
```

## 🔧 Erweiterungen

### Neue Handler hinzufügen

```typescript
// 1. Handler-Klasse erstellen
class EmailNotificationHandler {
  constructor(private emailService: EmailService) {
    const eventBus = ServiceEventBus.getInstance();
    eventBus.on('product.created', this.handleProductCreated.bind(this));
  }

  private async handleProductCreated(event: ProductCreatedEvent) {
    await this.emailService.sendNotification({
      subject: `New Product Created: ${event.productData.name}`,
      template: 'product-created',
      data: event
    });
  }
}

// 2. In App.ts registrieren
private initializeEventSystem(): void {
  const eventBus = ServiceEventBus.getInstance();
  const inventoryService = new InventoryService();
  const emailService = new EmailService();

  this.inventorySyncHandler = new InventorySyncHandler(inventoryService);
  this.emailHandler = new EmailNotificationHandler(emailService);
}
```

### Neue Event-Types

```typescript
// Event-Types erweitern
interface OrderCreatedEvent extends BaseEvent {
  orderId: string;
  customerId: string;
  products: ProductItem[];
  totalAmount: number;
}

// ServiceEventBus erweitern
emit(event: 'order.created', data: OrderCreatedEvent): boolean;

// Handler implementieren
eventBus.on('order.created', this.handleOrderCreated.bind(this));
```

## 🚀 Migration Guide

### Von Direct-Coupling zu Event-driven

**Vorher (Direct Coupling):**

```typescript
// ProductsRoutes mit direkter InventoryService-Dependency
class ProductsRoutes {
  constructor(private inventoryService: InventoryService) {}

  async createProduct(req: Request, res: Response) {
    const newProduct = await this.productsService.create(req.body);

    // Direkte Kopplung
    await this.inventoryService.create({
      articleNum: newProduct.id,
      productName: newProduct.name,
    });
  }
}
```

**Nachher (Event-driven):**

```typescript
// ProductsRoutes ohne direkte Dependencies
class ProductsRoutes {
  constructor() {
    this.eventBus = ServiceEventBus.getInstance();
  }

  async createProduct(req: Request, res: Response) {
    const newProduct = await this.productsService.create(req.body);

    // Event-basierte Kommunikation
    this.eventBus.emit("product.created", {
      productId: newProduct.id,
      productData: req.body,
      timestamp: new Date(),
    });
  }
}
```

## 📚 Weitere Ressourcen

- **Event-Driven Architecture Pattern**: [Martin Fowler's Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- **Node.js EventEmitter**: [Official Documentation](https://nodejs.org/api/events.html)
- **Microservices Patterns**: [Chris Richardson's Microservices.io](https://microservices.io/patterns/data/event-driven-architecture.html)

---

> 🔄 **Event-driven Architecture** ermöglicht es uns, saubere, testbare und erweiterbare Microservice-Systeme zu bauen, die dem Single Responsibility Principle folgen und gleichzeitig hoch performant und resilient sind.
