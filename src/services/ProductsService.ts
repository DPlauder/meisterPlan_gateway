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
    return apiFetch(this.baseUrl, {
      method: "POST",
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
