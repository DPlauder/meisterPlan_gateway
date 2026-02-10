# 🏗️ Hybrid Architecture: SaaS + On-Premise

## 📋 **Hybrid-Deployment Strategy**

### 🎯 **Deployment-Modi:**

- **SaaS (Cloud)** - Multi-Tenant, gehostet von Ihnen
- **On-Premise (Self-Hosted)** - Single-Tenant, beim Kunden installiert
- **Private Cloud** - Single-Tenant, von Ihnen in Kunden-VPC gehostet

## 🏗️ **Optimale Architektur-Struktur**

### 1. **Core-Business-Logic trennen**

```
meisterplan-erp/
├── 📂 packages/                    # Monorepo mit geteilten Packages
│   ├── 📂 core/                   # Shared Business Logic
│   │   ├── 📂 domain/             # Domain Models & Interfaces
│   │   ├── 📂 services/           # Business Logic Services
│   │   ├── 📂 events/             # Event Definitions
│   │   └── 📂 validators/         # Validation Logic
│   ├── 📂 gateway/                # Current Gateway (API Layer)
│   ├── 📂 saas-platform/         # SaaS-specific Components
│   │   ├── 📂 multi-tenant/       # Tenant Management
│   │   ├── 📂 billing/           # Subscription & Billing
│   │   ├── 📂 auth-service/      # Multi-Tenant Auth
│   │   └── 📂 usage-tracking/    # Analytics & Monitoring
│   ├── 📂 on-premise/            # On-Premise specific Components
│   │   ├── 📂 installer/         # Installation Scripts
│   │   ├── 📂 single-tenant/     # Single-Tenant Setup
│   │   ├── 📂 backup/            # Backup & Recovery
│   │   └── 📂 updates/           # Update Management
│   └── 📂 shared/                # Common Infrastructure
│       ├── 📂 database/          # Database Abstractions
│       ├── 📂 messaging/         # Event Bus Implementations
│       ├── 📂 security/          # Common Security Components
│       └── 📂 monitoring/        # Observability Tools
```

### 2. **Configuration-driven Deployment**

```typescript
// packages/core/config/DeploymentConfig.ts
export enum DeploymentMode {
  SAAS_MULTI_TENANT = "saas-multi-tenant",
  ON_PREMISE_SINGLE = "on-premise-single",
  PRIVATE_CLOUD = "private-cloud",
}

export interface DeploymentConfig {
  mode: DeploymentMode;
  database: DatabaseConfig;
  auth: AuthConfig;
  features: FeatureFlags;
  licensing: LicenseConfig;
}

// SaaS Configuration
const saasConfig: DeploymentConfig = {
  mode: DeploymentMode.SAAS_MULTI_TENANT,
  database: {
    type: "postgres",
    multiTenant: true,
    connectionPooling: true,
  },
  auth: {
    provider: "jwt-multi-tenant",
    sso: true,
    mfa: true,
  },
  features: {
    billing: true,
    analytics: true,
    usageTracking: true,
    whiteLabel: true,
  },
  licensing: {
    type: "subscription",
    enforcement: "cloud",
  },
};

// On-Premise Configuration
const onPremiseConfig: DeploymentConfig = {
  mode: DeploymentMode.ON_PREMISE_SINGLE,
  database: {
    type: "postgres", // or sqlite for smaller deployments
    multiTenant: false,
    embedded: true,
  },
  auth: {
    provider: "local-auth",
    ldap: true,
    sso: false, // Optional feature
  },
  features: {
    billing: false,
    analytics: false, // Local analytics only
    usageTracking: false,
    whiteLabel: true,
  },
  licensing: {
    type: "perpetual",
    enforcement: "license-key",
  },
};
```

### 3. **Adaptive Service Layer**

```typescript
// packages/core/services/ServiceFactory.ts
export class ServiceFactory {
  static create(config: DeploymentConfig): ServiceContainer {
    const container = new ServiceContainer();

    // Core Business Services (same for both)
    container.register("productsService", () => new ProductsService());
    container.register("inventoryService", () => new InventoryService());
    container.register(
      "businessCustomerService",
      () => new BusinessCustomerService()
    );

    // Deployment-specific Services
    if (config.mode === DeploymentMode.SAAS_MULTI_TENANT) {
      container.register("tenantService", () => new MultiTenantService());
      container.register("billingService", () => new BillingService());
      container.register("usageTracker", () => new UsageTrackingService());
    } else {
      container.register("tenantService", () => new SingleTenantService());
      container.register("licenseValidator", () => new LicenseValidator());
      container.register("updateService", () => new UpdateService());
    }

    // Database Layer
    container.register("database", () =>
      DatabaseFactory.create(config.database)
    );

    // Event Bus
    container.register("eventBus", () =>
      config.mode === DeploymentMode.SAAS_MULTI_TENANT
        ? new CloudEventBus()
        : new LocalEventBus()
    );

    return container;
  }
}
```

### 4. **Database Abstraction Layer**

```typescript
// packages/shared/database/DatabaseFactory.ts
export class DatabaseFactory {
  static create(config: DatabaseConfig): DatabaseAdapter {
    if (config.multiTenant) {
      return new MultiTenantDatabaseAdapter(config);
    } else {
      return new SingleTenantDatabaseAdapter(config);
    }
  }
}

// Multi-Tenant Implementation
class MultiTenantDatabaseAdapter implements DatabaseAdapter {
  async query(sql: string, params: any[], tenantId: string) {
    const tenantDb = await this.getTenantDatabase(tenantId);
    return tenantDb.query(sql, params);
  }

  private async getTenantDatabase(tenantId: string) {
    return this.connectionPool.getConnection(`tenant_${tenantId}`);
  }
}

// Single-Tenant Implementation
class SingleTenantDatabaseAdapter implements DatabaseAdapter {
  async query(sql: string, params: any[]) {
    return this.connection.query(sql, params);
  }
}
```

## 🚀 **Deployment-spezifische Implementierungen**

### SaaS Platform Components

```typescript
// packages/saas-platform/TenantManager.ts
export class SaaSTenantManager {
  async createTenant(companyData: CompanyRegistration): Promise<Tenant> {
    // 1. Provision Database
    const database = await this.provisionTenantDatabase(companyData.subdomain);

    // 2. Create Admin User
    const adminUser = await this.createAdminUser(companyData);

    // 3. Initialize Default Data
    await this.initializeDefaultData(database, adminUser);

    // 4. Setup Billing
    await this.billingService.createCustomer(companyData);

    // 5. Send Welcome Email
    await this.emailService.sendWelcomeEmail(adminUser);

    return new Tenant(companyData.subdomain, database, adminUser);
  }

  async provisionTenantDatabase(subdomain: string): Promise<TenantDatabase> {
    // Create dedicated schema or database
    const dbName = `tenant_${subdomain}`;
    await this.databaseProvisioner.createDatabase(dbName);
    await this.migrationService.runMigrations(dbName);
    return new TenantDatabase(dbName);
  }
}
```

### On-Premise Components

```typescript
// packages/on-premise/installer/InstallationManager.ts
export class OnPremiseInstaller {
  async install(config: InstallationConfig): Promise<InstallationResult> {
    // 1. System Requirements Check
    await this.checkSystemRequirements();

    // 2. Database Setup
    await this.setupDatabase(config.database);

    // 3. Application Deployment
    await this.deployApplication(config);

    // 4. Initial Admin User
    await this.createInitialAdmin(config.admin);

    // 5. License Activation
    await this.activateLicense(config.licenseKey);

    // 6. Start Services
    await this.startServices();

    return {
      status: "success",
      adminUrl: config.baseUrl,
      adminCredentials: config.admin,
    };
  }

  private async setupDatabase(dbConfig: DatabaseConfig) {
    if (dbConfig.type === "sqlite") {
      // Embedded SQLite for smaller deployments
      await this.setupSQLite(dbConfig.path);
    } else {
      // PostgreSQL for larger deployments
      await this.setupPostgreSQL(dbConfig);
    }
  }
}
```

## 🔧 **Feature Flag System**

```typescript
// packages/core/features/FeatureManager.ts
export class FeatureManager {
  private features: Map<string, boolean> = new Map();

  constructor(config: DeploymentConfig) {
    this.loadFeatures(config);
  }

  private loadFeatures(config: DeploymentConfig) {
    // SaaS Features
    if (config.mode === DeploymentMode.SAAS_MULTI_TENANT) {
      this.features.set("billing", true);
      this.features.set("usage-analytics", true);
      this.features.set("multi-tenant", true);
      this.features.set("cloud-backups", true);
    }

    // On-Premise Features
    if (config.mode === DeploymentMode.ON_PREMISE_SINGLE) {
      this.features.set("local-backups", true);
      this.features.set("ldap-integration", true);
      this.features.set("custom-branding", true);
      this.features.set("air-gapped-mode", true);
    }

    // License-based Features
    if (config.licensing.tier === "enterprise") {
      this.features.set("advanced-reporting", true);
      this.features.set("api-access", true);
      this.features.set("custom-integrations", true);
    }
  }

  isEnabled(feature: string): boolean {
    return this.features.get(feature) || false;
  }
}

// Usage in Routes
class ProductsRoutes {
  async createProduct(req: Request, res: Response) {
    // Core business logic (same for both deployments)
    const newProduct = await this.productsService.create(req.body);

    // SaaS-specific features
    if (this.featureManager.isEnabled("usage-analytics")) {
      await this.usageTracker.trackProductCreation(req.tenant.id);
    }

    // On-Premise specific features
    if (this.featureManager.isEnabled("local-backups")) {
      await this.backupService.scheduleBackup();
    }

    // Common event (works for both)
    this.eventBus.emit("product.created", {
      productId: newProduct.id,
      productData: req.body,
      timestamp: new Date(),
    });

    res.status(201).json(newProduct);
  }
}
```

## 📦 **Packaging & Distribution**

### SaaS Deployment

```yaml
# docker-compose.saas.yml
version: "3.8"
services:
  gateway:
    image: meisterplan/gateway:saas
    environment:
      - DEPLOYMENT_MODE=saas-multi-tenant
      - DATABASE_TYPE=postgres
      - MULTI_TENANT=true
      - BILLING_ENABLED=true

  tenant-provisioner:
    image: meisterplan/tenant-provisioner:latest

  billing-service:
    image: meisterplan/billing-service:latest

  usage-tracker:
    image: meisterplan/usage-tracker:latest
```

### On-Premise Deployment

```yaml
# docker-compose.onprem.yml
version: "3.8"
services:
  gateway:
    image: meisterplan/gateway:onprem
    environment:
      - DEPLOYMENT_MODE=on-premise-single
      - DATABASE_TYPE=postgres
      - MULTI_TENANT=false
      - BILLING_ENABLED=false

  backup-service:
    image: meisterplan/backup-service:latest

  update-service:
    image: meisterplan/update-service:latest
```

## 🔐 **Licensing & Authentication**

### SaaS Authentication

```typescript
// packages/saas-platform/auth/SaaSAuthProvider.ts
export class SaaSAuthProvider implements AuthProvider {
  async authenticate(token: string): Promise<AuthContext> {
    const payload = this.jwtService.verify(token);
    const tenant = await this.tenantService.getTenant(payload.tenantId);

    // Check subscription status
    const subscription = await this.billingService.getSubscription(tenant.id);
    if (subscription.status !== "active") {
      throw new Error("Subscription inactive");
    }

    return new AuthContext(payload.userId, tenant, subscription);
  }
}
```

### On-Premise Authentication

```typescript
// packages/on-premise/auth/OnPremiseAuthProvider.ts
export class OnPremiseAuthProvider implements AuthProvider {
  async authenticate(credentials: Credentials): Promise<AuthContext> {
    // Check license validity
    const license = await this.licenseValidator.validate();
    if (!license.isValid()) {
      throw new Error("Invalid license");
    }

    // Local user authentication
    const user = await this.localUserService.authenticate(credentials);

    // LDAP integration (if enabled)
    if (this.featureManager.isEnabled("ldap-integration")) {
      await this.ldapService.validateUser(user);
    }

    return new AuthContext(user.id, null, license);
  }
}
```

## 🎯 **Business Models**

### SaaS Pricing

```typescript
const SAAS_PLANS = {
  starter: {
    price: 29,
    limits: { products: 1000, users: 3 },
    features: ["basic_inventory", "email_support"],
  },
  professional: {
    price: 99,
    limits: { products: 10000, users: 10 },
    features: ["advanced_reporting", "api_access", "priority_support"],
  },
  enterprise: {
    price: 299,
    limits: { products: -1, users: -1 },
    features: ["white_label", "custom_integrations", "dedicated_support"],
  },
};
```

### On-Premise Licensing

```typescript
const ON_PREMISE_LICENSES = {
  small_business: {
    price: 2999, // One-time
    limits: { users: 10, companies: 1 },
    support: "1_year_included",
  },
  enterprise: {
    price: 9999, // One-time
    limits: { users: -1, companies: -1 },
    support: "3_years_included",
    features: ["ldap", "custom_branding", "air_gapped"],
  },
  enterprise_support: {
    price: 1999, // Annual
    features: ["priority_support", "updates", "training"],
  },
};
```

## 🚀 **Migration Strategy**

### Customer Migration Path

```typescript
// packages/core/migration/MigrationService.ts
export class MigrationService {
  // SaaS to On-Premise
  async migrateToOnPremise(
    tenantId: string,
    targetConfig: OnPremiseConfig
  ): Promise<MigrationResult> {
    // 1. Export tenant data
    const tenantData = await this.exportTenantData(tenantId);

    // 2. Generate on-premise package
    const installationPackage = await this.createOnPremisePackage(
      tenantData,
      targetConfig
    );

    // 3. Provide migration scripts
    const migrationScripts = await this.generateMigrationScripts(tenantData);

    return {
      installationPackage,
      migrationScripts,
      instructions: this.generateMigrationInstructions(),
    };
  }

  // On-Premise to SaaS
  async migrateToSaaS(
    backupFile: string,
    targetTenant: string
  ): Promise<MigrationResult> {
    // 1. Validate backup
    const backup = await this.validateBackup(backupFile);

    // 2. Create SaaS tenant
    const tenant = await this.saasManager.createTenant(targetTenant);

    // 3. Import data
    await this.importDataToTenant(backup.data, tenant.id);

    return {
      tenantUrl: `https://${targetTenant}.meisterplan.com`,
      migrationReport: this.generateMigrationReport(),
    };
  }
}
```

## 📊 **Monitoring & Support**

### Unified Monitoring

```typescript
// packages/shared/monitoring/MonitoringService.ts
export class MonitoringService {
  constructor(private config: DeploymentConfig) {}

  async collectMetrics(): Promise<SystemMetrics> {
    const baseMetrics = await this.collectBaseMetrics();

    if (this.config.mode === DeploymentMode.SAAS_MULTI_TENANT) {
      return {
        ...baseMetrics,
        tenants: await this.collectTenantMetrics(),
        billing: await this.collectBillingMetrics(),
      };
    } else {
      return {
        ...baseMetrics,
        license: await this.collectLicenseMetrics(),
        system: await this.collectSystemHealth(),
      };
    }
  }
}
```

## 🎯 **Go-to-Market Strategy**

### Target Segments

1. **SaaS (Cloud)**:

   - Small-Medium Businesses
   - Startups
   - Companies wanting managed infrastructure
   - International customers

2. **On-Premise**:
   - Large Enterprises
   - Highly regulated industries (Banking, Healthcare)
   - Companies with data sovereignty requirements
   - Air-gapped environments

### Pricing Strategy

- **SaaS**: Subscription-based, lower barrier to entry
- **On-Premise**: Higher upfront cost, perpetual licensing
- **Hybrid**: Custom enterprise deals with both components

---

## ✅ **Fazit: Optimale Hybrid-Architektur**

**Diese Struktur gibt Ihnen:**

- ✅ **Shared Core** - Einmal entwickeln, zweimal deployen
- ✅ **Flexible Deployment** - Kunden können wählen
- ✅ **Maximale Marktabdeckung** - Alle Kundensegmente
- ✅ **Skalierbare Architektur** - Event-driven Design funktioniert für beide
- ✅ **Einfache Wartung** - Core-Logic ist geteilt

**Entwicklungszeit: 8-12 Wochen für vollständige Hybrid-Implementation** 🚀
