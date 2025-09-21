import express, { Application } from "express";
import { RouterConfig } from "./config/RouterConfig";
import { CorsMiddleware } from "./middlewares/corsMiddleware";

export class App {
  private readonly app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    // CORS-Middleware muss vor anderen Middlewares geladen werden
    this.app.use(CorsMiddleware.getDefaultCors());

    this.app.use(express.json());
    // Weitere Middleware wie Logger, Auth etc. hier einbinden
  }

  private initializeRoutes(): void {
    RouterConfig.register(this.app);
  }

  public getApp(): Application {
    return this.app;
  }
}
