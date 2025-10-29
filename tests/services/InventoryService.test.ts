import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { InventoryService } from "../../src/services/InventoryService";
import { apiFetch } from "../../src/utils/apiFetch";
import { apiConfig } from "../../src/config/apiConfig";
import { mockData } from "../testUtils";

// Mock apiFetch
jest.mock("../../src/utils/apiFetch");
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

// Mock apiConfig
jest.mock("../../src/config/apiConfig", () => ({
  apiConfig: {
    inventory: "http://localhost:3000/api/inventory",
  },
}));

describe("InventoryService", () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with default base URL from config", () => {
      const service = new InventoryService();
      expect((service as any).baseUrl).toBe(apiConfig.inventory);
    });

    it("should accept custom base URL", () => {
      const customUrl = "http://custom-inventory-api.com";
      const service = new InventoryService(customUrl);
      expect((service as any).baseUrl).toBe(customUrl);
    });
  });

  describe("getAll", () => {
    it("should fetch all inventory items", async () => {
      mockApiFetch.mockResolvedValue(mockData.inventoryItems);

      const result = await inventoryService.getAll();

      expect(result).toEqual(mockData.inventoryItems);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory);
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle empty inventory response", async () => {
      mockApiFetch.mockResolvedValue([]);

      const result = await inventoryService.getAll();

      expect(result).toEqual([]);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory);
    });

    it("should throw error when API call fails", async () => {
      const errorMessage = "Network error";
      mockApiFetch.mockRejectedValue(new Error(errorMessage));

      await expect(inventoryService.getAll()).rejects.toThrow(errorMessage);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory);
    });
  });

  describe("getByArticleNum", () => {
    it("should fetch inventory item by article number", async () => {
      const articleNum = "ART001";
      mockApiFetch.mockResolvedValue(mockData.inventoryItem);

      const result = await inventoryService.getByArticleNum(articleNum);

      expect(result).toEqual(mockData.inventoryItem);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`
      );
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle article numbers with special characters", async () => {
      const articleNum = "ART-001_TEST";
      mockApiFetch.mockResolvedValue(mockData.inventoryItem);

      const result = await inventoryService.getByArticleNum(articleNum);

      expect(result).toEqual(mockData.inventoryItem);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`
      );
    });

    it("should return null for non-existent article", async () => {
      const articleNum = "NON_EXISTENT";
      mockApiFetch.mockResolvedValue(null);

      const result = await inventoryService.getByArticleNum(articleNum);

      expect(result).toBeNull();
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`
      );
    });

    it("should throw error when API call fails", async () => {
      const articleNum = "ART001";
      const errorMessage = "Item not found";
      mockApiFetch.mockRejectedValue(new Error(errorMessage));

      await expect(
        inventoryService.getByArticleNum(articleNum)
      ).rejects.toThrow(errorMessage);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`
      );
    });

    it("should handle empty string article number", async () => {
      const articleNum = "";
      mockApiFetch.mockResolvedValue(null);

      const result = await inventoryService.getByArticleNum(articleNum);

      expect(result).toBeNull();
      expect(mockApiFetch).toHaveBeenCalledWith(`${apiConfig.inventory}/`);
    });
  });

  describe("create", () => {
    it("should create new inventory item", async () => {
      const inventoryData = {
        articleNum: "ART004",
        productName: "New Product",
        quantity: 100,
        location: "Warehouse A",
      };
      const createdItem = { id: "4", ...inventoryData };
      mockApiFetch.mockResolvedValue(createdItem);

      const result = await inventoryService.create(inventoryData);

      expect(result).toEqual(createdItem);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory, {
        method: "POST",
        body: JSON.stringify(inventoryData),
      });
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle empty inventory data", async () => {
      const inventoryData = {};
      const createdItem = { id: "1", ...inventoryData };
      mockApiFetch.mockResolvedValue(createdItem);

      const result = await inventoryService.create(inventoryData);

      expect(result).toEqual(createdItem);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory, {
        method: "POST",
        body: JSON.stringify(inventoryData),
      });
    });

    it("should handle complex inventory data", async () => {
      const complexData = {
        articleNum: "ART005",
        productName: "Complex Product",
        quantity: 999,
        location: "Main Warehouse",
        supplier: "Premium Supplier",
        category: "Electronics",
        specifications: {
          weight: "2.5kg",
          dimensions: "30x20x10cm",
          color: "Black",
        },
        tags: ["electronic", "premium", "imported"],
        minThreshold: 10,
        maxThreshold: 1000,
      };
      mockApiFetch.mockResolvedValue(complexData);

      const result = await inventoryService.create(complexData);

      expect(result).toEqual(complexData);
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory, {
        method: "POST",
        body: JSON.stringify(complexData),
      });
    });

    it("should throw error when creation fails", async () => {
      const inventoryData = { articleNum: "ART001" };
      const errorMessage = "Validation failed";
      mockApiFetch.mockRejectedValue(new Error(errorMessage));

      await expect(inventoryService.create(inventoryData)).rejects.toThrow(
        errorMessage
      );
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory, {
        method: "POST",
        body: JSON.stringify(inventoryData),
      });
    });
  });

  describe("delete", () => {
    it("should delete inventory item successfully", async () => {
      const articleNum = "ART001";
      mockApiFetch.mockResolvedValue({ success: true });

      const result = await inventoryService.delete(articleNum);

      expect(result).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`,
        {
          method: "DELETE",
        }
      );
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it("should return false when deletion fails", async () => {
      const articleNum = "ART001";
      mockApiFetch.mockResolvedValue({ success: false });

      const result = await inventoryService.delete(articleNum);

      expect(result).toBe(false);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`,
        {
          method: "DELETE",
        }
      );
    });

    it("should return false when response has no success property", async () => {
      const articleNum = "ART001";
      mockApiFetch.mockResolvedValue({ status: "deleted" });

      const result = await inventoryService.delete(articleNum);

      expect(result).toBe(false);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`,
        {
          method: "DELETE",
        }
      );
    });

    it("should handle article numbers with special characters", async () => {
      const articleNum = "ART-001_DELETE";
      mockApiFetch.mockResolvedValue({ success: true });

      const result = await inventoryService.delete(articleNum);

      expect(result).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`,
        {
          method: "DELETE",
        }
      );
    });

    it("should throw error when API call fails", async () => {
      const articleNum = "ART001";
      const errorMessage = "Network error";
      mockApiFetch.mockRejectedValue(new Error(errorMessage));

      await expect(inventoryService.delete(articleNum)).rejects.toThrow(
        errorMessage
      );
      expect(mockApiFetch).toHaveBeenCalledWith(
        `${apiConfig.inventory}/${articleNum}`,
        {
          method: "DELETE",
        }
      );
    });

    it("should handle empty string article number", async () => {
      const articleNum = "";
      mockApiFetch.mockResolvedValue({ success: true });

      const result = await inventoryService.delete(articleNum);

      expect(result).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith(`${apiConfig.inventory}/`, {
        method: "DELETE",
      });
    });
  });

  describe("Custom Base URL", () => {
    it("should use custom base URL for all operations", async () => {
      const customUrl = "http://custom-api.com/inventory";
      const service = new InventoryService(customUrl);
      mockApiFetch.mockResolvedValue(mockData.inventoryItems);

      await service.getAll();
      expect(mockApiFetch).toHaveBeenCalledWith(customUrl);

      await service.getByArticleNum("ART001");
      expect(mockApiFetch).toHaveBeenCalledWith(`${customUrl}/ART001`);

      await service.create({ articleNum: "ART002" });
      expect(mockApiFetch).toHaveBeenCalledWith(customUrl, {
        method: "POST",
        body: JSON.stringify({ articleNum: "ART002" }),
      });

      mockApiFetch.mockResolvedValue({ success: true });
      await service.delete("ART001");
      expect(mockApiFetch).toHaveBeenCalledWith(`${customUrl}/ART001`, {
        method: "DELETE",
      });
    });
  });

  describe("Error Handling", () => {
    it("should propagate API errors correctly", async () => {
      const apiError = new Error("API Error");
      mockApiFetch.mockRejectedValue(apiError);

      await expect(inventoryService.getAll()).rejects.toThrow("API Error");
      await expect(inventoryService.getByArticleNum("ART001")).rejects.toThrow(
        "API Error"
      );
      await expect(inventoryService.create({})).rejects.toThrow("API Error");
      await expect(inventoryService.delete("ART001")).rejects.toThrow(
        "API Error"
      );
    });

    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockApiFetch.mockRejectedValue(timeoutError);

      await expect(inventoryService.getAll()).rejects.toThrow(
        "Request timeout"
      );
      expect(mockApiFetch).toHaveBeenCalledWith(apiConfig.inventory);
    });
  });
});
