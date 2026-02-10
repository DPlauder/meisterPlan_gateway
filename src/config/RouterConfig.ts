import { Application } from "express";
import { BusinessCustomerRoutes } from "../routes/BusinessCustomerRoutes";
import { ProductsRoutes } from "../routes/ProductsRoutes";
import { InventoryRoutes } from "../routes/InventoryRoutes";

export class RouterConfig {
  private static businessCustomerController: BusinessCustomerRoutes;
  private static productsController: ProductsRoutes;
  private static inventoryController: InventoryRoutes;

  public static register(app: Application): void {
    // Singleton-Pattern für alle Router um mehrfache Instanziierung zu verhindern
    if (!this.businessCustomerController) {
      this.businessCustomerController = new BusinessCustomerRoutes();
    }

    if (!this.productsController) {
      this.productsController = new ProductsRoutes();
    }

    if (!this.inventoryController) {
      this.inventoryController = new InventoryRoutes();
    }

    app.use("/business-customers", this.businessCustomerController.router);
    app.use("/products", this.productsController.router);
    app.use("/inventory", this.inventoryController.router);

    console.log("📋 Routes registered as singletons");
  }
}
