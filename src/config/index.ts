// Zentraler Re-Export aller Konfigurations-Module.
// Andere Teile der Anwendung können so mit einem einzigen Import
// auf alle Konfigurationen zugreifen:
//   import { env, apiConfig, RouterConfig } from "../config";
export { env } from "./env";
export { apiConfig } from "./apiConfig";
export { RouterConfig } from "./RouterConfig";
