import express, { Application } from "express";
import { RouterConfig } from "./config/RouterConfig";
import { CorsMiddleware } from "./middlewares/corsMiddleware";
import { ServiceEventBus } from "./events/ServiceEventBus";
import { InventorySyncHandler } from "./handlers/InventorySyncHandler";
import { InventoryService } from "./services/InventoryService";

export class App {
  private readonly app: Application;
  private inventorySyncHandler: InventorySyncHandler | undefined;
  private static instance: App | null = null;

  constructor() {
    if (App.instance) {
      throw new Error("App ist ein Singleton. Verwende getInstance()");
    }

    console.log("🚀 App wird erstellt...");
    this.app = express();
    this.initializeEventSystem();
    this.initializeMiddleware();
    this.initializeRoutes();

    App.instance = this;
    console.log("✅ App erfolgreich erstellt");
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private initializeMiddleware(): void {
    // CORS-Middleware muss vor anderen Middlewares geladen werden
    this.app.use(CorsMiddleware.getDefaultCors());

    this.app.use(express.json());
    // Weitere Middleware wie Logger, Auth etc. hier einbinden
  }

  private initializeEventSystem(): void {
    const eventBus = ServiceEventBus.getInstance();
    const inventoryService = new InventoryService();
    this.inventorySyncHandler =
      InventorySyncHandler.getInstance(inventoryService);

    console.log("Event-driven architecture initialized");
  }

  private initializeRoutes(): void {
    RouterConfig.register(this.app);
  }

  public getApp(): Application {
    return this.app;
  }

  public cleanup(): void {
    InventorySyncHandler.resetInstance();
  }

  public static resetInstance(): void {
    if (App.instance) {
      App.instance.cleanup();
      App.instance = null;
    }
  }
}
