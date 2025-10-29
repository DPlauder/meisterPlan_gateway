import express, { Application } from "express";
import { RouterConfig } from "./config/RouterConfig";
import { CorsMiddleware } from "./middlewares/corsMiddleware";
import { ServiceEventBus } from "./events/ServiceEventBus";
import { InventorySyncHandler } from "./handlers/InventorySyncHandler";
import { InventoryService } from "./services/InventoryService";

export class App {
  private readonly app: Application;
  private inventorySyncHandler: InventorySyncHandler | undefined;

  constructor() {
    this.app = express();
    this.initializeEventSystem();
    this.initializeMiddleware();
    this.initializeRoutes();
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
    this.inventorySyncHandler = new InventorySyncHandler(inventoryService);

    console.log("Event-driven architecture initialized");
  }

  private initializeRoutes(): void {
    RouterConfig.register(this.app);
  }

  public getApp(): Application {
    return this.app;
  }

  public cleanup(): void {
    if (this.inventorySyncHandler) {
      this.inventorySyncHandler.destroy();
    }
  }
}
