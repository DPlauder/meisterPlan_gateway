import { beforeAll, afterAll, jest } from "@jest/globals";

// Globale Test-Konfiguration
beforeAll(() => {
  // Mock-Umgebungsvariablen setzen
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";
  process.env.CORS_ORIGIN = "http://localhost:3000";

  // Console-Logs während Tests unterdrücken (optional)
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  // Cleanup nach allen Tests
  jest.restoreAllMocks();
});

// Mock für externe API-Aufrufe (falls verwendet)
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
