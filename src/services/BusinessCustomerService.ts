import { apiFetch } from "../utils/apiFetch";
import { apiConfig } from "../config/apiConfig";

export class BusinessCustomerService {
  private baseUrl: string;

  constructor(baseUrl: string = apiConfig.businessCustomer) {
    this.baseUrl = baseUrl;
  }

  async getById(id: string): Promise<any> {
    const url = `${this.baseUrl}/${id}`;
    return apiFetch(url);
  }

  async getAll(): Promise<any[]> {
    return apiFetch(this.baseUrl);
  }

  async create(customerData: any): Promise<any> {
    return apiFetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }
  async delete(id: string): Promise<boolean> {
    const url = `${this.baseUrl}/${id}`;
    const response = await apiFetch(url, { method: "DELETE" });
    console.log("delete response:", response);
    return response.success || false;
  }
}
