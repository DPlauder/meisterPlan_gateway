import { Router, Request, Response } from "express";
import { InventoryService } from "../services/InventoryService";

export class InventoryRoutes {
  public router = Router();
  public inventoryService: InventoryService;

  constructor() {
    this.router = Router();
    this.inventoryService = new InventoryService();
    this.registerRoutes();
  }
  private registerRoutes(): void {
    this.router.get("/", this.getAllInventory.bind(this));
    this.router.get("/:articleNum", this.getInventoryByArticleNum.bind(this));
    this.router.post("/", this.createInventory.bind(this));
    this.router.delete("/:articleNum", this.deleteInventory.bind(this));
  }
  private async getAllInventory(req: Request, res: Response): Promise<void> {
    try {
      const inventoryItems = await this.inventoryService.getAll();
      res.json(inventoryItems);
    } catch (error) {
      console.error("Error fetching all inventory items:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  private async getInventoryByArticleNum(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const articleNum = req.params.articleNum;
      if (!articleNum || typeof articleNum !== "string") {
        res.status(400).json({ error: "Invalid article number" });
        return;
      }
      const inventoryItem = await this.inventoryService.getByArticleNum(
        articleNum
      );
      res.json(inventoryItem);
    } catch (error) {
      console.error("Error fetching inventory item by article number:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  private async createInventory(req: Request, res: Response): Promise<void> {
    try {
      const newInventoryItem = await this.inventoryService.create(req.body);
      res.status(201).json(newInventoryItem);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  private async deleteInventory(req: Request, res: Response): Promise<void> {
    try {
      const articleNum = req.params.articleNum;
      if (!articleNum || typeof articleNum !== "string") {
        res.status(400).json({ error: "Invalid article number" });
        return;
      }
      await this.inventoryService.delete(articleNum);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
