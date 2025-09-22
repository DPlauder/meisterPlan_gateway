import { Router, Request, Response } from "express";
import { ProductsService } from "../services/ProductsService";

export class ProductsRoutes {
  public router: Router;
  private productsService: ProductsService;

  constructor() {
    this.router = Router();
    this.productsService = new ProductsService();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get("/", this.getAllProducts.bind(this));
    this.router.get("/:id", this.getProductById.bind(this));
    this.router.post("/", this.createProduct.bind(this));
    this.router.delete("/:id", this.deleteProduct.bind(this));
  }

  private async getAllProducts(req: Request, res: Response) {
    const products = await this.productsService.getAll();
    res.json(products);
  }

  private async getProductById(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      if (!productId || typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }
      const product = await this.productsService.getById(productId);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async createProduct(req: Request, res: Response) {
    const newProduct = await this.productsService.create(req.body);
    res.status(201).json(newProduct);
  }

  private async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      if (!productId || typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }
      const success = await this.productsService.delete(productId);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
