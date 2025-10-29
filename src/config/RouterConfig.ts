import { Application } from "express";
import { BusinessCustomerRoutes } from "../routes/BusinessCustomerRoutes";
import { ProductsRoutes } from "../routes/ProductsRoutes";
import { InventoryRoutes } from "../routes/InventoryRoutes";

export class RouterConfig {
  public static register(app: Application): void {
    const businessCustomerController = new BusinessCustomerRoutes();

    app.use("/business-customers", businessCustomerController.getRouter());

    // Event-driven Products Routes - Saubere Architektur ohne direkte Service-Kopplung
    app.use("/products", new ProductsRoutes().router);

    app.use("/inventory", new InventoryRoutes().router);

    // Additional routes can be registered here
    // e.g., app.use('/another-route', anotherController.getRouter());
  }
}
