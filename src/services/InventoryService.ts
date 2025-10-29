import { apiFetch } from "../utils/apiFetch";
import { apiConfig } from "../config/apiConfig";

export class InventoryService {
  private baseUrl: string;

  constructor(baseUrl: string = apiConfig.inventory) {
    this.baseUrl = baseUrl;
  }
  async getByArticleNum(articleNum: string): Promise<any> {
    const url = `${this.baseUrl}/${articleNum}`;
    return apiFetch(url);
  }
  async getAll(): Promise<any[]> {
    return apiFetch(this.baseUrl);
  }
  async create(inventoryData: any): Promise<any> {
    return apiFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(inventoryData),
    });
  }
  async delete(articleNum: string): Promise<boolean> {
    const url = `${this.baseUrl}/${articleNum}`;
    const response = await apiFetch(url, { method: "DELETE" });
    console.log("delete response:", response);
    return response.success || false;
  }
}
