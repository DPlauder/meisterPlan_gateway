// dotenv liest die .env-Datei im Projektstamm und schreibt alle
// enthaltenen Schlüssel-Wert-Paare in process.env, sodass sie wie
// normale Umgebungsvariablen ausgelesen werden können.
import dotenv from "dotenv";

dotenv.config();

/**
 * Hilfsfunktion: Gibt den Wert einer Umgebungsvariable zurück.
 *
 * - Ist die Variable gesetzt, wird ihr Wert zurückgegeben.
 * - Fehlt die Variable, wird der optionale `fallback` verwendet.
 * - Fehlt beides, wird beim Start ein Fehler geworfen – so werden
 *   fehlende Konfigurationen sofort und nicht erst zur Laufzeit bemerkt.
 */
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Umgebungsvariable "${key}" ist nicht gesetzt.`);
  }
  return value;
}

/**
 * Zentrales Konfigurationsobjekt für die gesamte Anwendung.
 *
 * Alle Umgebungsvariablen werden hier EINMALIG eingelesen und typisiert.
 * Der Rest der Anwendung importiert nur noch dieses Objekt – kein
 * direktes `process.env` außerhalb dieser Datei nötig.
 */
export const env = {
  // Aktuelle Laufzeitumgebung (development | staging | production | test).
  // Beeinflusst u. a. CORS-Einstellungen und Log-Level.
  nodeEnv: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "staging"
    | "test",

  // TCP-Port, auf dem der Express-Server lauscht.
  // parseInt mit Basis 10 verhindert Fehler bei Nullen am Anfang.
  port: parseInt(process.env.PORT ?? "3000", 10),

  // Erlaubter CORS-Origin für den Browser. Wird an die CORS-Middleware
  // weitergereicht. Mehrere Origins können komma-separiert angegeben werden.
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  // Base-URLs der nachgelagerten Microservices.
  // requireEnv() stellt sicher, dass die Variablen beim Start bekannt sind;
  // der zweite Parameter ist der lokale Entwicklungs-Fallback.
  api: {
    businessCustomerUrl: requireEnv(
      "BUSINESS_CUSTOMER_API_URL",
      "http://localhost:3001/api/business-customers",
    ),
    productsUrl: requireEnv(
      "PRODUCTS_API_URL",
      "http://localhost:8080/api/products",
    ),
    inventoryUrl: requireEnv(
      "INVENTORY_API_URL",
      "http://localhost:8081/api/inventory",
    ),
  },
};
