// Importiert das zentrale env-Objekt aus env.ts.
// Dadurch stammen alle URLs aus einer einzigen, validierten Quelle.
import { env } from "./env";

/**
 * Fertig aufgelöste API-URLs für alle nachgelagerten Services.
 *
 * Services und Routes verwenden dieses Objekt, um die Ziel-URL
 * einer Anfrage zu ermitteln. Die eigentlichen Werte kommen aus
 * den Umgebungsvariablen (siehe env.ts / .env.example).
 */
export const apiConfig = {
  // REST-API des Business-Customer-Microservices
  businessCustomer: env.api.businessCustomerUrl,
  // REST-API des Products-Microservices
  products: env.api.productsUrl,
  // REST-API des Inventory-Microservices
  inventory: env.api.inventoryUrl,
};
