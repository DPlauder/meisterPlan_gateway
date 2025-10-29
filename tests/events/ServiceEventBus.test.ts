import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { ServiceEventBus } from "../../src/events/ServiceEventBus";

describe("ServiceEventBus", () => {
  let eventBus: ServiceEventBus;

  beforeEach(() => {
    // EventBus-Singleton zurücksetzen für jeden Test
    (ServiceEventBus as any).instance = undefined;
    eventBus = ServiceEventBus.getInstance();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = ServiceEventBus.getInstance();
      const instance2 = ServiceEventBus.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("Event Emission and Handling", () => {
    it("should emit and handle product.created events", (done) => {
      const testEvent = {
        productId: "TEST-123",
        productData: {
          name: "Test Product",
          price: 99.99,
        },
        timestamp: new Date(),
      };

      eventBus.on("product.created", (event) => {
        expect(event).toEqual(testEvent);
        done();
      });

      eventBus.emit("product.created", testEvent);
    });

    it("should emit and handle product.updated events", (done) => {
      const testEvent = {
        productId: "TEST-456",
        productData: {
          name: "Updated Product",
        },
        timestamp: new Date(),
      };

      eventBus.on("product.updated", (event) => {
        expect(event).toEqual(testEvent);
        done();
      });

      eventBus.emit("product.updated", testEvent);
    });

    it("should emit and handle product.deleted events", (done) => {
      const testEvent = {
        productId: "TEST-789",
        timestamp: new Date(),
      };

      eventBus.on("product.deleted", (event) => {
        expect(event).toEqual(testEvent);
        done();
      });

      eventBus.emit("product.deleted", testEvent);
    });

    it("should support multiple listeners for the same event", (done) => {
      let callCount = 0;
      const testEvent = {
        productId: "TEST-MULTI",
        productData: { name: "Multi Test" },
        timestamp: new Date(),
      };

      const listener1 = () => {
        callCount++;
        if (callCount === 2) done();
      };

      const listener2 = () => {
        callCount++;
        if (callCount === 2) done();
      };

      eventBus.on("product.created", listener1);
      eventBus.on("product.created", listener2);

      eventBus.emit("product.created", testEvent);
    });
  });

  describe("Event Listener Management", () => {
    it("should remove specific event listeners", () => {
      let eventReceived = false;

      const listener = () => {
        eventReceived = true;
      };

      eventBus.on("product.created", listener);
      eventBus.removeListener("product.created", listener);

      eventBus.emit("product.created", {
        productId: "TEST",
        productData: { name: "Test Product" },
        timestamp: new Date(),
      });

      expect(eventReceived).toBe(false);
    });

    it("should remove all listeners for specific event", () => {
      let callCount = 0;

      const listener1 = () => callCount++;
      const listener2 = () => callCount++;

      eventBus.on("product.updated", listener1);
      eventBus.on("product.updated", listener2);

      eventBus.removeAllListeners("product.updated");

      eventBus.emit("product.updated", {
        productId: "TEST",
        productData: { name: "Updated Test Product" },
        timestamp: new Date(),
      });

      expect(callCount).toBe(0);
    });

    it("should remove all listeners when called without event name", () => {
      let createdCalled = false;
      let updatedCalled = false;

      eventBus.on("product.created", () => (createdCalled = true));
      eventBus.on("product.updated", () => (updatedCalled = true));

      eventBus.removeAllListeners();

      eventBus.emit("product.created", {
        productId: "TEST1",
        productData: { name: "Test Product 1" },
        timestamp: new Date(),
      });

      eventBus.emit("product.updated", {
        productId: "TEST2",
        productData: { name: "Updated Test Product 2" },
        timestamp: new Date(),
      });

      expect(createdCalled).toBe(false);
      expect(updatedCalled).toBe(false);
    });
  });

  describe("Event Types", () => {
    it("should handle events with all required product.created fields", (done) => {
      const completeEvent = {
        productId: "COMPLETE-123",
        productData: {
          name: "Complete Product",
          price: 199.99,
          supplier: "Test Supplier",
          category: "Electronics",
        },
        timestamp: new Date(),
      };

      eventBus.on("product.created", (event) => {
        expect(event.productId).toBe("COMPLETE-123");
        expect(event.productData.name).toBe("Complete Product");
        expect(event.productData.price).toBe(199.99);
        expect(event.timestamp).toBeInstanceOf(Date);
        done();
      });

      eventBus.emit("product.created", completeEvent);
    });

    it("should handle minimal product.deleted events", (done) => {
      const minimalEvent = {
        productId: "DELETE-123",
        timestamp: new Date(),
      };

      eventBus.on("product.deleted", (event) => {
        expect(event.productId).toBe("DELETE-123");
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(event).not.toHaveProperty("productData");
        done();
      });

      eventBus.emit("product.deleted", minimalEvent);
    });
  });
});
