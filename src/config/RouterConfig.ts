import { Application } from 'express';
import { BusinessCustomerRoutes } from '../routes/BusinessCustomerRoutes';

export class RouterConfig {
  public static register(app: Application): void {
    const businessCustomerController = new BusinessCustomerRoutes();

    app.use('/business-customers', businessCustomerController.getRouter());
    // Additional routes can be registered here
    // e.g., app.use('/another-route', anotherController.getRouter());
  }
}
