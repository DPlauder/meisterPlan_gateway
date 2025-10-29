# 🚀 MeisterPlan Gateway

Das MeisterPlan Gateway ist eine **hochmoderne Node.js/Express-Microservice-Anwendung**, die als zentraler API-Gateway für die gesamte MeisterPlan-Infrastruktur dient. Die Anwendung ist vollständig in **TypeScript** entwickelt und implementiert moderne Software-Engineering-Praktiken mit umfassender Test-Abdeckung.

## ✨ Features

### 🎯 Core Functionality

- **REST-API für Business-Kunden** (CRUD-Operationen)
- **Produktverwaltung** (Products Service Integration)
- **Inventarverwaltung** (Inventory Management System)
- **Zentrale Service-Orchestrierung** mit modularer Architektur

### 🏗️ Architecture & Quality

- **TypeScript-First** für 100% Typensicherheit
- **Modulare Service-Layer-Architektur**
- **Umfassende Test-Suite** (90.5% Pass-Rate, 126 Tests)
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
│   ├── 📄 App.ts                    # Express Application Setup
│   ├── 📄 server.ts                 # Server Entry Point
│   ├── 📂 config/                   # Konfigurationsdateien
│   │   ├── 📄 apiConfig.ts          # API-Endpunkt-URLs
│   │   ├── 📄 env.ts                # Umgebungsvariablen
│   │   ├── 📄 index.ts              # Config-Exports
│   │   └── 📄 RouterConfig.ts       # Router-Konfiguration
│   ├── 📂 middlewares/              # Express-Middleware
│   │   ├── 📄 authMiddleware.ts     # Authentifizierung
│   │   ├── 📄 corsMiddleware.ts     # CORS-Konfiguration
│   │   └── 📄 logger.ts             # Request-Logging
│   ├── 📂 routes/                   # Express-Routes
│   │   ├── 📄 BusinessCustomerRoutes.ts  # Business-Kunden-API
│   │   ├── 📄 ProductsRoutes.ts     # Produkte-API
│   │   ├── 📄 InventoryRoutes.ts    # Inventar-API
│   │   ├── 📄 auth.ts               # Authentifizierung-Routes
│   │   └── 📄 index.ts              # Route-Exports
│   ├── 📂 services/                 # Service-Layer
│   │   ├── 📄 BusinessCustomerService.ts  # Business-Kunden-Service
│   │   ├── 📄 ProductsService.ts    # Produkte-Service
│   │   └── 📄 InventoryService.ts   # Inventar-Service
│   └── 📂 utils/                    # Utility-Funktionen
│       └── 📄 apiFetch.ts           # HTTP-Client-Wrapper
├── 📂 tests/                        # Test-Suite (126 Tests)
│   ├── 📄 setup.ts                  # Test-Setup & Mocks
│   ├── 📄 testUtils.ts              # Test-Utilities
│   ├── 📂 config/                   # Config-Tests
│   ├── 📂 routes/                   # Route-Tests (Unit)
│   ├── 📂 services/                 # Service-Tests (Unit)
│   └── 📂 integration/              # Integration-Tests
├── 📂 dist/                         # Compiled JavaScript (Build)
├── 📄 jest.config.js                # Jest-Testing-Konfiguration
├── 📄 tsconfig.json                 # TypeScript-Konfiguration
├── 📄 Dockerfile                    # Docker-Container-Setup
├── 📄 TEST_DOCUMENTATION.md         # Umfassende Test-Dokumentation
└── 📄 package.json                  # Dependencies & Scripts
```

### 🎨 Architektur-Prinzipien

**🔄 Service-Layer-Pattern**

- Saubere Trennung zwischen Routes, Services und Utilities
- Modulare Service-Integration für externe APIs
- Dependency-Injection-Ready für Testability

**🎯 RESTful API Design**

- Konsistente HTTP-Methoden (GET, POST, DELETE)
- Standardisierte Error-Handling-Responses
- JSON-basierte Kommunikation

**🛡️ Type-Safety First**

- Vollständige TypeScript-Implementierung
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

- **126 Tests total** über 7 Test-Suites
- **Unit Tests**: Routes, Services, Configuration
- **Integration Tests**: End-to-End-Workflows
- **Mock-System**: Vollständig gemockte externe Services
- Detaillierte Dokumentation: [`TEST_DOCUMENTATION.md`](./TEST_DOCUMENTATION.md)

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

### 📦 Products API

```http
GET    /products      # Alle Produkte abrufen
GET    /products/:id  # Spezifisches Produkt abrufen
POST   /products      # Neues Produkt erstellen
DELETE /products/:id  # Produkt löschen
```

### 📊 Inventory API

```http
GET    /inventory                 # Alle Lagerbestände abrufen
GET    /inventory/:articleNum     # Bestand nach Artikelnummer
POST   /inventory                 # Neuen Lagerbestand erstellen
DELETE /inventory/:articleNum     # Lagerbestand löschen
```

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

**Route-Handler-Pattern:**

```typescript
// Clean Route-Handler mit Service-Integration
class BusinessCustomerRoutes {
  constructor(private service = new BusinessCustomerService()) {}

  async getCustomerById(req: Request, res: Response) {
    try {
      const customer = await this.service.getById(req.params.id);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
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

- 📄 **[Test-Dokumentation](./TEST_DOCUMENTATION.md)** - Umfassende Test-Suite-Dokumentation
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
