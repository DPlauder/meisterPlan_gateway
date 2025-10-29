# 🚀 MeisterPlan Gateway

Das MeisterPlan Gateway ist eine **hochmoderne Node.js/Express-Microservice-Anwendung**, die als zentraler API-Gateway für die gesamte MeisterPlan-Infrastruktur dient. Die Anwendung ist vollständig in **TypeScript** entwickelt und implementiert moderne Software-Engineering-Praktiken mit umfassender Test-Abdeckung.

## ✨ Features

### 🎯 Core Functionality

- **REST-API für Business-Kunden** (CRUD-Operationen)
- **Event-driven Produktverwaltung** (Products Service mit automatischer Inventory-Synchronisation)
- **Inventarverwaltung** (Inventory Management System)
- **Zentrale Service-Orchestrierung** mit Event-driven Architecture

### 🏗️ Architecture & Quality

- **TypeScript-First** für 100% Typensicherheit
- **Event-driven Microservice Architecture** mit loosely coupled Services
- **Umfassende Test-Suite** (Event-System vollständig getestet)
- **ServiceEventBus** für saubere Service-Kommunikation
- **Professional CORS-Middleware** mit umgebungsbasierten Konfigurationen
- **Docker & Kubernetes Ready** für Cloud-Native-Deployments

### 🔧 Development Experience

- **Hot-Reload Development** mit ts-node-dev
- **Jest-Testing-Framework** mit TypeScript-Support
- **Supertest HTTP-Testing** für Integration-Tests
- **Coverage-Reports** und Verbose-Testing-Modi

## 📁 Projektstruktur

```
gateway/
├── 📂 src/                          # Source Code (TypeScript)
│   ├── 📄 App.ts                    # Express Application Setup + Event System
│   ├── 📄 server.ts                 # Server Entry Point
│   ├── 📂 config/                   # Konfigurationsdateien
│   │   ├── 📄 apiConfig.ts          # API-Endpunkt-URLs
│   │   ├── 📄 env.ts                # Umgebungsvariablen
│   │   ├── 📄 index.ts              # Config-Exports
│   │   └── 📄 RouterConfig.ts       # Router-Konfiguration
│   ├── 📂 events/                   # Event-driven Architecture
│   │   └── 📄 ServiceEventBus.ts    # Zentraler Event Bus (Singleton)
│   ├── 📂 handlers/                 # Event Handler
│   │   └── 📄 InventorySyncHandler.ts # Product-Inventory Synchronisation
│   ├── 📂 middlewares/              # Express-Middleware
│   │   ├── 📄 authMiddleware.ts     # Authentifizierung
│   │   ├── 📄 corsMiddleware.ts     # CORS-Konfiguration
│   │   └── 📄 logger.ts             # Request-Logging
│   ├── 📂 routes/                   # Express-Routes
│   │   ├── 📄 BusinessCustomerRoutes.ts  # Business-Kunden-API
│   │   ├── 📄 ProductsRoutes.ts     # Event-driven Produkte-API
│   │   ├── 📄 InventoryRoutes.ts    # Inventar-API
│   │   ├── 📄 auth.ts               # Authentifizierung-Routes
│   │   └── 📄 index.ts              # Route-Exports
│   ├── 📂 services/                 # Service-Layer
│   │   ├── 📄 BusinessCustomerService.ts  # Business-Kunden-Service
│   │   ├── 📄 ProductsService.ts    # Produkte-Service
│   │   └── 📄 InventoryService.ts   # Inventar-Service
│   └── 📂 utils/                    # Utility-Funktionen
│       └── 📄 apiFetch.ts           # HTTP-Client-Wrapper
├── 📂 tests/                        # Test-Suite (Event-driven getestet)
│   ├── 📄 setup.ts                  # Test-Setup & Mocks
│   ├── 📄 testUtils.ts              # Test-Utilities
│   ├── 📂 config/                   # Config-Tests
│   ├── 📂 events/                   # Event-System Tests
│   ├── 📂 handlers/                 # Event-Handler Tests
│   ├── 📂 routes/                   # Route-Tests (Unit)
│   ├── 📂 services/                 # Service-Tests (Unit)
│   └── 📂 integration/              # Integration-Tests + Event-driven Tests
├── 📂 dist/                         # Compiled JavaScript (Build)
├── 📄 jest.config.js                # Jest-Testing-Konfiguration
├── 📄 tsconfig.json                 # TypeScript-Konfiguration
├── 📄 Dockerfile                    # Docker-Container-Setup
├── 📄 TEST_DOCUMENTATION.md         # Umfassende Test-Dokumentation
└── 📄 package.json                  # Dependencies & Scripts
```

### 🎨 Architektur-Prinzipien

**🔄 Event-driven Architecture**

- **ServiceEventBus** als zentraler Event-Dispatcher (Singleton-Pattern)
- **Loosely Coupled Services** ohne direkte Dependencies
- **InventorySyncHandler** für automatische Product-Inventory-Synchronisation
- **Single Responsibility Principle** für jeden Event-Handler

**🎯 RESTful API Design**

- Konsistente HTTP-Methoden (GET, POST, PUT, DELETE)
- Event-basierte Service-Kommunikation
- Standardisierte Error-Handling-Responses
- JSON-basierte Kommunikation

**🛡️ Type-Safety First**

- Vollständige TypeScript-Implementierung
- Typisierte Event-Definitionen (ProductCreatedEvent, ProductUpdatedEvent, etc.)
- Interface-Definitionen für alle Data-Models
- Compile-Time Error-Detection

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** für Repository-Management

### Installation

1. **Repository klonen:**

   ```bash
   git clone https://github.com/DPlauder/meisterPlan_gateway.git
   cd gateway
   ```

2. **Dependencies installieren:**

   ```bash
   npm install
   ```

3. **Umgebung konfigurieren:**
   ```bash
   # .env-Datei erstellen (optional)
   cp .env.example .env
   ```

### 🔧 Development starten

```bash
# Development-Server mit Hot-Reload
npm run dev

# Alternative: Direkt mit ts-node-dev
npx ts-node-dev src/server.ts
```

🌐 **Server läuft auf:** [http://localhost:3000](http://localhost:3000)

### 📦 Production Build

```bash
# TypeScript kompilieren
npm run build

# Production-Server starten
npm start
```

## 🧪 Testing

Das Projekt verfügt über eine **umfassende Test-Suite** mit 126 Tests und 90.5% Pass-Rate.

### Test-Kommandos

```bash
# Alle Tests ausführen
npm test

# Tests im Watch-Modus (Development)
npm run test:watch

# Coverage-Report generieren
npm run test:coverage

# Nur Integration-Tests
npm run test:integration

# Nur Unit-Tests
npm run test:unit

# Verbose-Ausgabe für Debugging
npm run test:verbose
```

### 📊 Test-Coverage

- **Event-System**: ServiceEventBus und InventorySyncHandler vollständig getestet
- **Unit Tests**: Routes, Services, Event-Handler, Configuration
- **Integration Tests**: End-to-End Event-driven Workflows
- **Event-driven Tests**: Product-Inventory Synchronisation validiert
- **Mock-System**: Vollständig gemockte externe Services
- Detaillierte Dokumentation: [`TEST_DOCUMENTATION.md`](./TEST_DOCUMENTATION.md)

### 🔄 Event-System Tests

```bash
# Event-System Tests ausführen
npm test -- tests/events tests/handlers

# Event-driven Integration Tests
npm test -- tests/integration/event-driven.integration.test.ts
```

**Test-Beispiele:**

- ✅ ServiceEventBus Singleton-Verhalten
- ✅ Event-Emission und -Handling
- ✅ InventorySyncHandler automatische Synchronisation
- ✅ Event-Error-Handling und Resilience
- ✅ Event-Listener Cleanup

## 🔄 Event-driven Architecture

### ServiceEventBus

Das Herzstück der Event-driven Architecture ist der **ServiceEventBus** - ein Singleton-EventEmitter, der alle Service-Kommunikation koordiniert.

```typescript
import { ServiceEventBus } from "./events/ServiceEventBus";

// Event emittieren
const eventBus = ServiceEventBus.getInstance();
eventBus.emit("product.created", {
  productId: "PROD-123",
  productData: { name: "New Product", price: 99.99 },
  timestamp: new Date(),
});

// Event-Handler registrieren
eventBus.on("product.created", (event) => {
  console.log(`Product ${event.productId} created`);
});
```

### Event-Types

**Product Events:**

- `product.created` - Neues Produkt erstellt
- `product.updated` - Produkt aktualisiert
- `product.deleted` - Produkt gelöscht

### InventorySyncHandler

Automatische Synchronisation zwischen Products und Inventory:

```typescript
// Wird automatisch in App.ts initialisiert
const inventorySyncHandler = new InventorySyncHandler(inventoryService);

// Reagiert auf Product-Events:
// product.created  → inventory.create()
// product.updated  → inventory.update()
// product.deleted  → inventory.delete()
```

### Architektur-Benefits

✅ **Loose Coupling** - Services kennen sich nicht direkt  
✅ **Single Responsibility** - Jeder Handler hat einen klaren Zweck  
✅ **Testability** - Handler isoliert testbar  
✅ **Resilience** - Fehler in einem Handler blockieren andere nicht  
✅ **Extensibility** - Neue Handler einfach hinzufügbar

## 🌐 API-Dokumentation

### Service-Endpoints

Das Gateway orchestriert drei Haupt-Services:

| Service                | Base URL              | Beschreibung            |
| ---------------------- | --------------------- | ----------------------- |
| **Business Customers** | `/business-customers` | Kundenverwaltung        |
| **Products**           | `/products`           | Produktkatalog          |
| **Inventory**          | `/inventory`          | Lagerbestandsverwaltung |

### 👥 Business Customers API

```http
GET    /business-customers      # Alle Kunden abrufen
GET    /business-customers/:id  # Spezifischen Kunden abrufen
POST   /business-customers      # Neuen Kunden erstellen
DELETE /business-customers/:id  # Kunden löschen
```

**Beispiel-Request:**

```javascript
// POST /business-customers
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+49-123-456789",
  "address": {
    "street": "Musterstraße 123",
    "city": "Berlin",
    "postalCode": "10115",
    "country": "Germany"
  }
}
```

### 📦 Products API (Event-driven)

```http
GET    /products      # Alle Produkte abrufen
GET    /products/:id  # Spezifisches Produkt abrufen
POST   /products      # Neues Produkt erstellen → product.created Event
PUT    /products/:id  # Produkt aktualisieren → product.updated Event
DELETE /products/:id  # Produkt löschen → product.deleted Event
```

**🔥 Event-driven Features:**

- **Automatische Inventory-Synchronisation** bei allen CRUD-Operationen
- **Resiliente Architektur** - Product-Operationen funktionieren auch bei Inventory-Service-Ausfällen
- **Loose Coupling** - Services kennen sich nicht direkt

### 📊 Inventory API

```http
GET    /inventory                 # Alle Lagerbestände abrufen
GET    /inventory/:articleNum     # Bestand nach Artikelnummer
POST   /inventory                 # Neuen Lagerbestand erstellen
PUT    /inventory/:articleNum     # Lagerbestand aktualisieren
DELETE /inventory/:articleNum     # Lagerbestand löschen
```

**🔄 Event-Integration:**

- **Automatische Synchronisation** durch InventorySyncHandler
- **Event-basierte Updates** von Products-Service
- **Artikelnummer-basierte Zuordnung** (Product.id = Inventory.articleNum)

**Beispiel-Request:**

```javascript
// POST /inventory
{
  "articleNum": "ART001",
  "productName": "Sample Product",
  "quantity": 150,
  "location": "Warehouse A",
  "supplier": "Supplier GmbH"
}
```

## 🛡️ CORS-Konfiguration

Das Gateway enthält eine **hochflexible CORS-Middleware** mit umgebungsbasierten Sicherheitsrichtlinien:

### 🔧 Verfügbare CORS-Modi

| Umgebung        | Modus      | Origins             | Beschreibung                        |
| --------------- | ---------- | ------------------- | ----------------------------------- |
| **Development** | Permissiv  | `*`                 | Alle Origins für lokale Entwicklung |
| **Staging**     | Moderat    | Localhost + Staging | Test-Umgebungen                     |
| **Production**  | Restriktiv | Definierte Domains  | Nur verifizierte Origins            |

### 💻 CORS-Middleware Implementation

```typescript
import { CorsMiddleware } from "./middlewares/corsMiddleware";

// Automatische umgebungsbasierte Konfiguration
app.use(CorsMiddleware.getDefaultCors());

// Entwicklungsmodus (alle Origins erlaubt)
app.use(CorsMiddleware.getDevCors());

// Production-Modus (nur sichere Domains)
app.use(
  CorsMiddleware.getProductionCors([
    "https://meisterplan.com",
    "https://app.meisterplan.com",
  ])
);
```

### 🌍 Umgebungsvariablen

```bash
# Automatische CORS-Erkennung
NODE_ENV=development  # Permissive CORS für alle Origins
NODE_ENV=staging      # Moderate CORS für Test-Umgebungen
NODE_ENV=production   # Restriktive CORS nur für definierte Domains
```

### 🛡️ Sicherheitsfeatures

- ✅ **Credentials-Support** für authentifizierte Cross-Origin-Requests
- ✅ **HTTP-Methods-Kontrolle** (GET, POST, PUT, DELETE, OPTIONS)
- ✅ **Header-Whitelisting** mit flexibler Konfiguration
- ✅ **Preflight-Caching** für optimierte Performance
- ✅ **Origin-Validation** mit Pattern-Matching

## 🐳 Containerisierung & Deployment

### Docker-Setup

Das Projekt ist **cloud-native** und containerisiert mit optimiertem Multi-Stage-Dockerfile:

```bash
# Docker-Image bauen
docker build -t meisterplan/gateway:latest .

# Container lokal starten
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  meisterplan/gateway:latest

# Mit docker-compose (wenn vorhanden)
docker-compose up --build
```

**Docker-Features:**

- 🚀 Multi-Stage-Build für minimale Image-Größe
- 🛡️ Non-Root-User für erhöhte Sicherheit
- 📦 Optimierte Layer-Caching für schnelle Builds
- 🔧 Health-Check-Integration

### ☸️ Kubernetes-Deployment

```bash
# Beispiel-Manifestdateien anwenden
kubectl apply -f k8s/

# Oder einzeln:
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/configmap.yaml
```

**Kubernetes-Features:**

- 📈 Horizontal Pod Autoscaler (HPA) Ready
- 🔄 Rolling-Update-Deployment-Strategie
- 🌐 Service-Discovery für Microservice-Integration
- 📊 Resource-Limits und Health-Checks

### 🌍 Environment-Configuration

```bash
# Development
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Staging
NODE_ENV=staging
PORT=3000
CORS_ORIGIN=https://staging.meisterplan.com

# Production
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://meisterplan.com,https://app.meisterplan.com
```

## ⚙️ Konfiguration

### API-Service-URLs

```typescript
// src/config/apiConfig.ts
export const apiConfig = {
  businessCustomer: "http://localhost:3001/api/business-customers",
  products: "http://localhost:8080/api/products",
  inventory: "http://localhost:8081/api/inventory",
};
```

### Middleware-Stack

```typescript
// Express-Middleware-Pipeline
app.use(express.json()); // JSON-Body-Parser
app.use(CorsMiddleware.getDefaultCors()); // CORS-Handling
app.use("/api", apiRoutes); // API-Routes
app.use(errorHandler); // Global Error Handler
```

## 💡 Entwicklung & Best Practices

### Code-Architektur-Patterns

**Service-Layer-Pattern:**

```typescript
// Service-Class für externe API-Integration
class BusinessCustomerService {
  constructor(private baseUrl: string = apiConfig.businessCustomer) {}

  async getById(id: string): Promise<BusinessCustomer> {
    return await apiFetch(`${this.baseUrl}/${id}`);
  }
}
```

**Event-driven Route-Handler-Pattern:**

```typescript
// Event-driven ProductsRoutes ohne direkte Service-Dependencies
class ProductsRoutes {
  constructor() {
    this.eventBus = ServiceEventBus.getInstance();
  }

  async createProduct(req: Request, res: Response) {
    try {
      const newProduct = await this.productsService.create(req.body);

      // Event emittieren für lose gekoppelte Services
      this.eventBus.emit("product.created", {
        productId: newProduct.id,
        productData: req.body,
        timestamp: new Date(),
      });

      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
```

**Event-Handler-Pattern:**

```typescript
// Spezialisierter Handler für Service-Synchronisation
class InventorySyncHandler {
  constructor(private inventoryService: InventoryService) {
    const eventBus = ServiceEventBus.getInstance();
    eventBus.on("product.created", this.handleProductCreated.bind(this));
  }

  private async handleProductCreated(event: ProductCreatedEvent) {
    try {
      await this.inventoryService.create({
        articleNum: event.productId,
        productName: event.productData.name,
        quantity: 0,
        location: "Main Warehouse",
      });
    } catch (error) {
      console.error(
        `Failed to create inventory for ${event.productId}:`,
        error
      );
    }
  }
}
```

### 🔧 Development-Workflow

```bash
# 1. Feature-Branch erstellen
git checkout -b feature/new-endpoint

# 2. Tests schreiben (TDD-Approach)
npm run test:watch

# 3. Implementation entwickeln
npm run dev

# 4. Tests validieren
npm test

# 5. Build testen
npm run build
```

### 📊 Code-Quality-Standards

- ✅ **TypeScript-Strict-Mode** für maximale Type-Safety
- ✅ **Jest-Testing** mit 90.5% Pass-Rate
- ✅ **ESLint/Prettier** für konsistenten Code-Style (konfigurierbar)
- ✅ **Git-Hooks** für Pre-Commit-Testing
- ✅ **Dependency-Updates** mit automatisierten Security-Checks

## 🚀 Performance & Monitoring

### Metriken & Logging

```typescript
// Request-Logging-Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

### Health-Check-Endpoint

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T10:30:00Z",
  "services": {
    "businessCustomer": "connected",
    "products": "connected",
    "inventory": "connected"
  }
}
```

## 🤝 Contributing

### Pull-Request-Workflow

1. **Fork** das Repository
2. **Feature-Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Tests** hinzufügen und bestehen lassen (`npm test`)
4. **Commit** mit aussagekräftiger Message (`git commit -m 'Add AmazingFeature'`)
5. **Push** to Branch (`git push origin feature/AmazingFeature`)
6. **Pull Request** erstellen

### 📋 Code-Review-Kriterien

- ✅ Alle Tests bestehen (`npm test`)
- ✅ TypeScript-Build erfolgreich (`npm run build`)
- ✅ Code-Coverage nicht reduziert
- ✅ API-Dokumentation aktualisiert
- ✅ Error-Handling implementiert

## 📚 Weitere Dokumentation

- � **[Event-driven Architecture](./docs/EVENT_DRIVEN_ARCHITECTURE.md)** - Vollständige Event-System-Dokumentation
- 🔄 **[Product-Inventory Synchronisation](./docs/PRODUCT_INVENTORY_SYNC.md)** - Event-basierte Service-Synchronisation
- �📄 **[Test-Dokumentation](./TEST_DOCUMENTATION.md)** - Umfassende Test-Suite-Dokumentation
- 🐳 **[Docker-Guide](./docs/docker.md)** - Container-Setup und Deployment
- ☸️ **[Kubernetes-Guide](./docs/kubernetes.md)** - K8s-Deployment-Strategien
- 🔧 **[API-Reference](./docs/api.md)** - Detaillierte API-Spezifikation

## 📞 Support & Contact

- **Repository**: [meisterPlan_gateway](https://github.com/DPlauder/meisterPlan_gateway)
- **Issues**: [GitHub Issues](https://github.com/DPlauder/meisterPlan_gateway/issues)
- **Maintainer**: DPlauder

## 📜 Lizenz

**MIT License** - Siehe [LICENSE](./LICENSE) für Details.

---

> 🚀 **MeisterPlan Gateway** - Production-Ready Microservice Gateway with TypeScript, comprehensive testing, and cloud-native deployment capabilities.
