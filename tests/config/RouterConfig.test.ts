import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import express, { Application } from "express";
import { RouterConfig } from "../../src/config/RouterConfig";

describe("RouterConfig", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
  });

  it("should register all routes correctly", () => {
    // Spy auf app.use
    const useSpy = jest.spyOn(app, "use");

    RouterConfig.register(app);

    // Überprüfen, dass alle Routen registriert wurden
    expect(useSpy).toHaveBeenCalledWith(
      "/business-customers",
      expect.any(Object)
    );
    expect(useSpy).toHaveBeenCalledWith("/products", expect.any(Object));
    expect(useSpy).toHaveBeenCalledWith("/inventory", expect.any(Object));
    expect(useSpy).toHaveBeenCalledTimes(3);
  });

  it("should create router instances correctly", () => {
    expect(() => RouterConfig.register(app)).not.toThrow();
  });

  it("should be a static method", () => {
    expect(typeof RouterConfig.register).toBe("function");
    expect(RouterConfig.register.length).toBe(1); // Erwartete Anzahl Parameter
  });

  it("should register routes in correct order", () => {
    const useSpy = jest.spyOn(app, "use");

    RouterConfig.register(app);

    const calls = useSpy.mock.calls;
    expect(calls[0]?.[0]).toBe("/business-customers");
    expect(calls[1]?.[0]).toBe("/products");
    expect(calls[2]?.[0]).toBe("/inventory");
  });
});
