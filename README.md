# MeisterPlan Gateway

Das MeisterPlan Gateway ist eine Node.js/Express-Anwendung, die als Middleware für die Verwaltung von Business-Kunden dient. Die Anwendung ist in TypeScript geschrieben und folgt einer klaren Trennung von Routen, Services und Hilfsfunktionen.

## Features

- REST-API für Business-Kunden (GET, POST)
- Saubere Projektstruktur mit Services und Routen
- TypeScript für Typensicherheit
- Docker- und Kubernetes-Deployment vorbereitet

## Projektstruktur

- **src/services/**  
  Service-Klassen für die Kommunikation mit externen APIs (z.B. `BusinessCustomerService`).

- **src/routes/**  
  Express-Routen für die API-Endpunkte (z.B. `BusinessCustomerRoutes`).

- **src/utils/**  
  Hilfsfunktionen wie `apiFetch` für HTTP-Anfragen.

- **src/config/**  
  Konfigurationsdateien, z.B. API-URLs.

- **k8s/**  
  Kubernetes-Manifestdateien für Deployment und Service.

## Installation

1. Repository klonen:

   ```bash
   git clone <REPOSITORY_URL>
   cd gateway
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## Entwicklung starten

```bash
npx ts-node-dev src/App.ts
```

Der Server läuft standardmäßig auf [http://localhost:3000](http://localhost:3000).

## Build & Produktion

1. Projekt bauen:

   ```bash
   npm run build
   ```

2. Starten:
   ```bash
   node dist/App.js
   ```

## Docker

Das Projekt enthält ein optimiertes Dockerfile. Zum Bauen und Starten:

```bash
docker build -t meisterplan-gateway .
docker run -p 3000:3000 meisterplan-gateway
```

## Kubernetes

Im Ordner `k8s/` befinden sich Beispiel-Manifestdateien für Deployment und Service.

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## Beispiel-Endpunkte

- **GET /business-customer/:id**  
  Gibt einen Business-Kunden anhand der ID zurück.

- **GET /business-customer**  
  Gibt eine Liste aller Business-Kunden zurück.

- **POST /business-customer**  
  Erstellt einen neuen Business-Kunden.

## Beispiel: Service-Nutzung in einer Route

```typescript
import { BusinessCustomerService } from "./services/businessCustomerService";

const service = new BusinessCustomerService();
const customer = await service.getById("123");
```

## Tests

Tests können mit folgendem Befehl ausgeführt werden:

```bash
npm test
```

## Lizenz

MIT License
