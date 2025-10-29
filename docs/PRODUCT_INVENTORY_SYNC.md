# Product-Inventory Synchronisation (Event-driven)

## 🎯 **Event-driven Synchronisation**

Die Gateway-Anwendung implementiert eine **Event-driven Architecture** für die automatische Synchronisation zwischen dem **Products-Service** und dem **Inventory-Service**. Durch den **ServiceEventBus** und **InventorySyncHandler** werden alle Product-Änderungen automatisch an das Inventory-System propagiert - **ohne direkte Service-Kopplung**.

## 🔄 **Event-driven Synchronisations-Workflows**

### 1. **Product Creation → Event → Inventory Creation**

```typescript
POST /products
{
  "name": "New Product",
  "price": 99.99,
  "supplier": "Supplier Inc."
}
```

**Event-Flow:**

```
ProductsRoutes.createProduct()
       ↓
EventBus.emit('product.created', {
  productId: "PROD-123",
  productData: { name: "New Product", supplier: "Supplier Inc." },
  timestamp: new Date()
})
       ↓
InventorySyncHandler.handleProductCreated()
       ↓
InventoryService.create({
  articleNum: "PROD-123",
  productName: "New Product",
  quantity: 0,
  location: "Main Warehouse",
  supplier: "Supplier Inc."
})
```

### 2. **Product Update → Event → Inventory Update**

```typescript
PUT /products/{id}
{
  "name": "Updated Product Name",
  "supplier": "New Supplier"
}
```

**Event-Flow:**

```
ProductsRoutes.updateProduct()
       ↓
EventBus.emit('product.updated', {
  productId: "PROD-123",
  productData: { name: "Updated Product Name", supplier: "New Supplier" },
  timestamp: new Date()
})
       ↓
InventorySyncHandler.handleProductUpdated()
       ↓
InventoryService.update("PROD-123", {
  productName: "Updated Product Name",
  supplier: "New Supplier"
})
```

### 3. **Product Deletion → Event → Inventory Deletion**

```typescript
DELETE / products / { id };
```

**Event-Flow:**

```
ProductsRoutes.deleteProduct()
       ↓
EventBus.emit('product.deleted', {
  productId: "PROD-123",
  timestamp: new Date()
})
       ↓
InventorySyncHandler.handleProductDeleted()
       ↓
InventoryService.delete("PROD-123")
```

## 🛡️ **Event-driven Fehler-Resilienz**

- **Entkoppelte Fehler-Behandlung**: Inventory-Service-Fehler blockieren nicht die Product-Operations
- **Event-Handler-Isolation**: Fehler in einem Handler betreffen andere Handler nicht
- **Resiliente Event-Verarbeitung**: Events werden asynchron verarbeitet
- **Comprehensive Logging**: Alle Sync-Operationen werden für jedes Event geloggt
- **Fallback-Mechanismen**: Jeder Event-Handler hat eigene Error-Recovery

**Error-Handling Beispiel:**

```typescript
private async handleProductCreated(event: ProductCreatedEvent) {
  try {
    await this.inventoryService.create(inventoryData);
    console.log(`✅ Inventory item created for product ${event.productId}`);
  } catch (error) {
    console.error(`Failed to create inventory item for product ${event.productId}:`, error);
    // Fehler wird nicht weiterpropagiert - andere Handler funktionieren weiterhin
  }
}
```

## 🔧 **Event-driven Implementation**

### **Event-System Komponenten:**

- ✅ `ServiceEventBus` - Zentraler Event-Dispatcher (Singleton)
- ✅ `InventorySyncHandler` - Event-Handler für automatische Synchronisation
- ✅ Event-Types: `ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductDeletedEvent`

### **Erweiterte Services:**

- ✅ `ProductsService.update()` - PUT-Methode hinzugefügt
- ✅ `InventoryService.update()` - PUT-Methode hinzugefügt

### **Event-driven Routes:**

- ✅ `ProductsRoutes` - Event-emission statt direkter Service-Kopplung
- ✅ `InventoryRoutes` - PUT-Route für Updates

### **Neue API-Endpoints:**

- ✅ `PUT /products/{id}` - Produkt aktualisieren mit Event-emission
- ✅ `PUT /inventory/{articleNum}` - Inventory-Item direkt aktualisieren

### **App-Integration:**

````typescript
// App.ts - System-Initialisierung
private initializeEventSystem(): void {
  const eventBus = ServiceEventBus.getInstance();
  const inventoryService = new InventoryService();
  this.inventorySyncHandler = new InventorySyncHandler(inventoryService);

  console.log('Event-driven architecture initialized');
}

## 📊 **Event-driven Test-Abdeckung**

### **ServiceEventBus Tests:**
- ✅ Singleton-Pattern Verhalten
- ✅ Event-Emission und -Handling
- ✅ Multiple Event-Listener
- ✅ Event-Listener Management
- ✅ Memory-Leak Prevention

### **InventorySyncHandler Tests:**
- ✅ Product-Created Event → Inventory-Create
- ✅ Product-Updated Event → Inventory-Update
- ✅ Product-Deleted Event → Inventory-Delete
- ✅ Error-Handling und Resilience
- ✅ Event-Listener Cleanup

### **Integration Tests:**
- ✅ End-to-End Event-Flow Testing
- ✅ Event-Bus Integration in App
- ✅ Event-Error-Handling Scenarios
- ✅ Event-Timestamp Validation

### **ProductsRoutes Tests:**
- ✅ Event-Emission bei CRUD-Operationen
- ✅ EventBus Singleton-Integration
- ✅ Error-Scenarios ohne Event-Emission

**Alle Event-System Tests bestehen!** ✅

## 🎮 **Verwendung**

### **Beispiel: Kompletter Product-Lifecycle**

1. **Erstelle Produkt** (automatisch mit Inventory):

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Awesome Product",
    "price": 149.99,
    "description": "Great product",
    "supplier": "Best Supplier Ltd."
  }'
````

2. **Update Produkt** (synchronisiert Inventory):

```bash
curl -X PUT http://localhost:3000/products/123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Even Better Product",
    "price": 199.99,
    "supplier": "Premium Supplier Inc."
  }'
```

3. **Lösche Produkt** (entfernt auch Inventory):

```bash
curl -X DELETE http://localhost:3000/products/123
```

## 🔍 **Monitoring & Debugging**

**Console-Logs für Tracking:**

```
✅ Inventory item created for product 123
✅ Inventory item updated for product 123
✅ Inventory item deleted for product 123
⚠️  Failed to update inventory item: [error details]
```

## 🚀 **Vorteile der Event-driven Implementation**

- **🔄 Automatische Synchronisation** - Event-basierte, asynchrone Synchronisation
- **🛡️ Loose Coupling** - Services kennen sich nicht direkt (nur über Events)
- **📈 Highly Scalable** - Event-Handler können unabhängig skaliert werden
- **🧩 Single Responsibility** - Jeder Handler hat eine klare, abgegrenzte Aufgabe
- **🧪 Fully Testable** - Event-System isoliert und umfassend getestet
- **🔧 Easily Extensible** - Neue Handler können ohne Code-Änderungen hinzugefügt werden
- **🛡️ Fault Tolerance** - Fehler in einem Handler beeinträchtigen andere nicht
- **📝 Event-driven Audit-Trail** - Alle Events werden mit Timestamps geloggt

## 🎯 **Event-driven Architecture ist implementiert!** ✅

Die **Event-driven Architecture** ist vollständig implementiert und produktionsbereit:

### **Was bereits implementiert ist:**

- ✅ **ServiceEventBus** - Zentraler Event-Dispatcher
- ✅ **InventorySyncHandler** - Automatische Synchronisation über Events
- ✅ **Typisierte Events** - ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent
- ✅ **Comprehensive Testing** - Vollständige Test-Abdeckung des Event-Systems
- ✅ **Error Resilience** - Fault-tolerante Event-Verarbeitung
- ✅ **Clean Architecture** - Loose Coupling und Single Responsibility

### **Mögliche Erweiterungen:**

- **Message Queue Integration**: RabbitMQ/Apache Kafka für externe Event-Distribution
- **Event Persistence**: Event-Sourcing für Audit-Logs und Replay-Funktionalität
- **Retry-Mechanismen**: Dead Letter Queues für Failed-Event-Handling
- **Event-Versioning**: Schema-Evolution für Event-Types
- **Cross-Service Events**: Events zwischen verschiedenen Microservices
