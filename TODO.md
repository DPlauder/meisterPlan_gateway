# 📋 MeisterPlan Gateway - Verbesserungs-Roadmap

**Letztes Update**: 12. März 2026  
**Gesamtaufwand geschätzt**: ~8h 40min

---

## 🔴 **1. KRITISCHE PROBLEME (Höchste Priorität)**

### 1.1 Implementiere `src/config/env.ts`

- **Aufwand**: 30 Minuten
- **Status**: ✅ Erledigt (12.03.2026)
- **Beschreibung**: Zentrale Umgebungsvariablen-Verwaltung
- **Akzeptanzkriterien**:
  - [x] Alle env-Variablen exportieren (PORT, NODE_ENV, API-URLs, etc.)
  - [x] Defaults für Development-Umgebung
  - [x] Type-Safe Environment-Zugriff
  - [x] Validierung erforderlicher Variablen
- **Abhängigkeiten**: Keine
- **Dateien**: `src/config/env.ts`

### 1.2 Implementiere `src/middlewares/logger.ts`

- **Aufwand**: 30 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Strukturiertes Logging-System
- **Akzeptanzkriterien**:
  - [ ] Request/Response-Logging Middleware
  - [ ] Log-Level-Struktur (info, warn, error, debug)
  - [ ] Strukturiertes JSON-Logging
  - [ ] Ersetze alle console.log() Aufrufe durch logger calls
- **Abhängigkeiten**: `src/config/env.ts`
- **Dateien**: `src/middlewares/logger.ts`, `src/App.ts`

### 1.3 Implementiere `ProductUpdatedEvent`

- **Aufwand**: 20 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Vollständige Event-Handler für Product-Updates
- **Akzeptanzkriterien**:
  - [ ] ProductUpdatedEvent vollständig definieren (nicht nur Interface)
  - [ ] Event-Handler in InventorySyncHandler registrieren
  - [ ] Update-Event in ProductsRoutes.updateProduct() emittieren
  - [ ] Tests schreiben für Update-Event
- **Abhängigkeiten**: Keine
- **Dateien**: `src/events/ServiceEventBus.ts`, `src/routes/ProductsRoutes.ts`, `src/handlers/InventorySyncHandler.ts`

### 1.4 Globale Error-Handler in `App.ts`

- **Aufwand**: 20 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Express Error-Handling Middleware
- **Akzeptanzkriterien**:
  - [ ] Error-Handling Middleware hinzufügen
  - [ ] 404-Handler für unbekannte Routes
  - [ ] Globale Error-Logging
  - [ ] Konsistente Error-Response-Format
- **Abhängigkeiten**: `src/middlewares/logger.ts`
- **Dateien**: `src/App.ts`

---

## 🟡 **2. ARCHITEKTUR & CODE-QUALITÄT**

### 2.1 Service-Typisierung durchführen

- **Aufwand**: 1 Stunde
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Ersetze `any` Types mit konkreten Interfaces
- **Akzeptanzkriterien**:
  - [ ] `InventoryItem` Interface definieren
  - [ ] `Product` Interface definieren
  - [ ] `BusinessCustomer` Interface definieren
  - [ ] Alle Service-Methoden typisieren
  - [ ] InventoryService vollständig typisieren
  - [ ] ProductsService vollständig typisieren
  - [ ] BusinessCustomerService vollständig typisieren
- **Abhängigkeiten**: Keine
- **Dateien**: `src/services/*.ts`, neue Datei `src/types/models.ts`

### 2.2 Service-Naming standardisieren

- **Aufwand**: 15 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Konsistente Naming-Konventionen
- **Akzeptanzkriterien**:
  - [ ] Entscheide: `id` oder `articleNum` (empfohlen: `id`)
  - [ ] Passe alle Services an
  - [ ] Update Tests
- **Abhängigkeiten**: `2.1 Service-Typisierung`
- **Dateien**: `src/services/*.ts`, `src/routes/*.ts`, `tests/**/*`

### 2.3 Input-Validierung mit `zod`

- **Aufwand**: 1.5 Stunden
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Schema-Validierung für API-Endpoints
- **Akzeptanzkriterien**:
  - [ ] `zod` als Dependency hinzufügen
  - [ ] Validation Schemas für Product, Inventory, BusinessCustomer
  - [ ] Validation Middleware implementieren
  - [ ] Validation in allen Routes testen
- **Abhängigkeiten**: `2.1 Service-Typisierung`
- **Dateien**: `src/validators/`, alle Route-Dateien

---

## 🟡 **3. TESTING & FEHLERBEHANDLUNG**

### 3.1 Test-Fehler beheben

- **Aufwand**: 1 Stunde
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: 12 fehlgeschlagene Tests fixen
- **Akzeptanzkriterien**:
  - [ ] CORS Preflight-Tests reparieren
  - [ ] Router-Konfiguration-Mocking fixen
  - [ ] Express-Verhalten korrekt mocken
  - [ ] 100% Test-Erfolgsrate erreichen (114/114)
- **Abhängigkeiten**: Keine
- **Dateien**: `tests/**/*.test.ts`, `jest.config.js`

### 3.2 Event-Bus Integration Tests

- **Aufwand**: 45 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: End-to-End Tests für Event-Listener
- **Akzeptanzkriterien**:
  - [ ] Test für Product Creation Event
  - [ ] Test für Product Update Event
  - [ ] Test für Product Deletion Event
  - [ ] Inventory Sync vollständig testen
- **Abhängigkeiten**: `1.3 ProductUpdatedEvent`
- **Dateien**: `tests/integration/event-system.integration.test.ts`

---

## 🟢 **4. PERFORMANCE & SICHERHEIT**

### 4.1 Authentifizierung (JWT) implementieren

- **Aufwand**: 1.5 Stunden
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: JWT-basierte Authentifizierung
- **Akzeptanzkriterien**:
  - [ ] JWT-Library hinzufügen (`jsonwebtoken`)
  - [ ] Token-Generierung implementieren
  - [ ] AuthMiddleware vollständig implementieren
  - [ ] Protected Routes testen
- **Abhängigkeiten**: Keine
- **Dateien**: `src/middlewares/authMiddleware.ts`, `src/routes/auth.ts`

### 4.2 Rate-Limiting hinzufügen

- **Aufwand**: 30 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: DoS-Schutz mit Rate-Limiting
- **Akzeptanzkriterien**:
  - [ ] `express-rate-limit` installieren
  - [ ] Rate-Limiting Middleware erstellen
  - [ ] Different limits für verschiedene Endpoints
  - [ ] Tests schreiben
- **Abhängigkeiten**: Keine
- **Dateien**: `src/middlewares/rateLimiter.ts`

### 4.3 Fetch-Error-Handling verbessern

- **Aufwand**: 20 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Retry-Logik und besseres Error-Handling
- **Akzeptanzkriterien**:
  - [ ] Exponential Backoff Retry implementieren
  - [ ] Unterscheide zwischen permanenten und temporären Fehler
  - [ ] Timeout-Handling hinzufügen
- **Abhängigkeiten**: Keine
- **Dateien**: `src/utils/apiFetch.ts`

---

## 🔵 **5. DOKUMENTATION & DEVOPS**

### 5.1 API-Dokumentation (Swagger)

- **Aufwand**: 1 Stunde
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: OpenAPI/Swagger-Dokumentation
- **Akzeptanzkriterien**:
  - [ ] `swagger-ui-express` installieren
  - [ ] OpenAPI-Specification schreiben
  - [ ] `/api-docs` Endpoint implementieren
  - [ ] Alle Endpoints dokumentieren
- **Abhängigkeiten**: Keine
- **Dateien**: `src/docs/swagger.ts`, neue Datei `swagger.yaml` oder `swagger.ts`

### 5.2 `.env.example` erstellen

- **Aufwand**: 10 Minuten
- **Status**: ✅ Erledigt (12.03.2026)
- **Beschreibung**: Environment-Template-Datei
- **Akzeptanzkriterien**:
  - [ ] `.env.example` mit allen benötigten Variablen
  - [ ] Dokumentation der Variablen
  - [ ] Update README.md mit Setup-Instruktionen
- **Abhängigkeiten**: `1.1 env.ts implementieren`
- **Dateien**: `.env.example`

### 5.3 GitHub Actions CI/CD-Pipeline

- **Aufwand**: 1 Stunde
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Automated Testing & Deployment
- **Akzeptanzkriterien**:
  - [ ] Test-Workflow erstellen (npm test)
  - [ ] Build-Workflow erstellen (npm run build)
  - [ ] Lint-Workflow (wenn aktiviert)
  - [ ] Docker Build workflow
- **Abhängigkeiten**: `3.1 Test-Fehler beheben`
- **Dateien**: `.github/workflows/*.yml`

### 5.4 README.md erweitern

- **Aufwand**: 30 Minuten
- **Status**: ⬜ Nicht gestartet
- **Beschreibung**: Ausführliche Dokumentation
- **Akzeptanzkriterien**:
  - [ ] Installation & Setup-Guide
  - [ ] Environment-Konfiguration
  - [ ] API-Endpoints Übersicht
  - [ ] Testing-Guide
  - [ ] Deployment-Guide
- **Abhängigkeiten**: `5.2 .env.example`
- **Dateien**: `README.md`

---

## 📊 **ABHÄNGIGKEITS-GRAPH**

```
🔴 KRITISCHE PHASE
├── 1.1 env.ts ✓
│   └── 1.2 logger.ts ✓
│       └── 1.4 Error-Handler ✓
├── 1.3 ProductUpdatedEvent ✓
│   └── 3.2 Event-Bus Tests ✓

🟡 ARCHITEKTUR PHASE
├── 2.1 Service-Typisierung ✓
│   └── 2.2 Naming standardisieren ✓
│   └── 2.3 Input-Validierung ✓

🟢 SICHERHEIT & DEVOPS PHASE
├── 4.1 JWT Authentication
├── 4.2 Rate-Limiting
├── 4.3 Fetch-Retry
├── 5.1 Swagger Docs
├── 5.2 .env.example
│   └── 5.4 README erweitern
└── 5.3 CI/CD Pipeline
    └── 3.1 Test-Fehler beheben (prerequisite)
```

---

## ✅ **CHECKLISTE FÜR COMPLETION**

- [ ] Alle kritischen Probleme behoben
- [ ] Alle Tests grün (114/114)
- [ ] Service-Typisierung abgeschlossen (0 `any` Types)
- [ ] Authentifizierung implementiert
- [ ] API-Dokumentation verfügbar
- [ ] CI/CD Pipeline läuft
- [ ] `.env.example` vorhanden
- [ ] README.md aktualisiert
- [ ] Code-Review durchgeführt
- [ ] Production-Ready

---

## 📝 **NOTIZEN**

- Dieses TODO basiert auf der Analyse vom 12. März 2026
- Zeiten sind Schätzungen (±20%)
- Test-Fokus: 90% → 100% Abdeckung
- Sicherheit: Production-Ready machen
- Dokumentation: Developer Experience verbessern
