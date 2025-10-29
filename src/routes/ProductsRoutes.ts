import { Router, Request, Response } from "express";
import { ProductsService } from "../services/ProductsService";
import { ServiceEventBus } from "../events/ServiceEventBus";

/**
 * Event-driven ProductsRoutes ohne direkte Inventory-Dependencies
 * Folgt Single Responsibility Principle und Clean Architecture
 */
export class ProductsRoutes {
  public router: Router;
  private productsService: ProductsService;
  private eventBus: ServiceEventBus;

  constructor() {
    this.router = Router();
    this.productsService = new ProductsService();
    this.eventBus = ServiceEventBus.getInstance();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get("/", this.getAllProducts.bind(this));
    this.router.get("/:id", this.getProductById.bind(this));
    this.router.post("/", this.createProduct.bind(this));
    this.router.put("/:id", this.updateProduct.bind(this));
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
    try {
      // Nur Product-Service verwenden - keine direkte Inventory-Kopplung
      const newProduct = await this.productsService.create(req.body);

      // Event emittieren für andere Services (Inventory, Analytics, etc.)
      this.eventBus.emit("product.created", {
        productId: newProduct.id || `PROD-${Date.now()}`,
        productData: {
          name: newProduct.name || req.body.name,
          price: newProduct.price || req.body.price,
          description: newProduct.description || req.body.description,
          supplier: req.body.supplier,
        },
        timestamp: new Date(),
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async updateProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      if (!productId || typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const updatedProduct = await this.productsService.update(
        productId,
        req.body
      );

      if (!updatedProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Event für Update emittieren
      this.eventBus.emit("product.updated", {
        productId,
        productData: {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          supplier: req.body.supplier,
        },
        timestamp: new Date(),
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      if (!productId || typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const success = await this.productsService.delete(productId);

      if (success) {
        // Event für Deletion emittieren
        this.eventBus.emit("product.deleted", {
          productId,
          timestamp: new Date(),
        });
      }

      res.status(success ? 204 : 404).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
