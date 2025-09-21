import { Router, Request, Response } from "express";
import { BusinessCustomerService } from "../services/BusinessCustomerService";

export class BusinessCustomerRoutes {
  public router: Router;
  private businessCustomerService: BusinessCustomerService;

  constructor() {
    this.router = Router();
    this.businessCustomerService = new BusinessCustomerService();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/:id", this.getCustomerById.bind(this));
    this.router.get("/", this.getAllCustomers.bind(this));
    this.router.delete("/:id", this.deleteCustomer.bind(this));
    this.router.post("/", this.createCustomer.bind(this));
  }
  public getRouter(): Router {
    return this.router;
  }

  private async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.params.id;
      if (typeof customerId !== "string") {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }
      const customer = await this.businessCustomerService.getById(customerId);
      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching business customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.businessCustomerService.getAll();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching all business customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.params.id;
      if (!customerId || typeof customerId !== "string") {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }
      const deleted = await this.businessCustomerService.delete(customerId);
      if (!deleted) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting business customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerData = req.body;
      if (!customerData || typeof customerData !== "object") {
        res.status(400).json({ error: "Invalid customer data" });
        return;
      }
      const newCustomer = await this.businessCustomerService.create(
        customerData
      );
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating business customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
