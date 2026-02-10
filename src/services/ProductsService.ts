import { apiFetch } from "../utils/apiFetch";
import { apiConfig } from "../config/apiConfig";

export class ProductsService {
  private baseUrl: string;

  constructor(baseUrl: string = apiConfig.products) {
    this.baseUrl = baseUrl;
  }
  async getById(id: string): Promise<any> {
    const url = `${this.baseUrl}/${id}`;
    return apiFetch(url);
  }
  async getAll(): Promise<any[]> {
    return apiFetch(this.baseUrl);
  }
  async create(productData: any): Promise<any> {
    try {
      return await apiFetch(this.baseUrl, {
        method: "POST",
        body: JSON.stringify(productData),
      });
    } catch (error) {
      // Fallback für Entwicklung - Mock-Produkt erstellen
      console.warn("⚠️ Products API not available, using mock data:", error);
      return {
        id: `PROD-${Date.now()}`,
        name: productData.name,
        price: productData.price,
        supplier: productData.supplier,
        description: productData.description,
        createdAt: new Date().toISOString(),
      };
    }
  }
  async update(id: string, productData: any): Promise<any> {
    const url = `${this.baseUrl}/${id}`;
    return apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async delete(id: string): Promise<boolean> {
    const url = `${this.baseUrl}/${id}`;
    const response = await apiFetch(url, { method: "DELETE" });
    console.log("delete response:", response);
    return response.success || false;
  }
}
