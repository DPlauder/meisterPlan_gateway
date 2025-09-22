import { Application } from "express";
import { BusinessCustomerRoutes } from "../routes/BusinessCustomerRoutes";
import { ProductsRoutes } from "../routes/ProductsRoutes";

export class RouterConfig {
  public static register(app: Application): void {
    const businessCustomerController = new BusinessCustomerRoutes();

    app.use("/business-customers", businessCustomerController.getRouter());
    app.use("/products", new ProductsRoutes().router);
    // Additional routes can be registered here
    // e.g., app.use('/another-route', anotherController.getRouter());
  }
}
