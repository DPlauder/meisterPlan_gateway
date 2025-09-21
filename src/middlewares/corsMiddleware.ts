import cors from "cors";
import { CorsOptions } from "cors";

/**
 * CORS-Konfiguration für das Gateway
 *
 * Diese Middleware konfiguriert Cross-Origin Resource Sharing (CORS)
 * für das Gateway, um Anfragen von verschiedenen Origins zu erlauben.
 */
export class CorsMiddleware {
  /**
   * Erstellt CORS-Middleware mit Standard-Konfiguration
   * @returns Express CORS Middleware
   */
  public static getDefaultCors() {
    const corsOptions: CorsOptions = {
      origin: this.getAllowedOrigins(),
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "Cache-Control",
      ],
      credentials: true, // Erlaubt Cookies und Auth-Header
      optionsSuccessStatus: 200, // Für ältere Browser
    };

    return cors(corsOptions);
  }

  /**
   * Erstellt CORS-Middleware mit benutzerdefinierten Optionen
   * @param options Custom CORS-Optionen
   * @returns Express CORS Middleware
   */
  public static getCustomCors(options: CorsOptions) {
    return cors(options);
  }

  /**
   * Bestimmt die erlaubten Origins basierend auf der Umgebung
   * @returns Array von erlaubten Origins oder true für alle
   */
  private static getAllowedOrigins(): string[] | boolean {
    const environment = process.env.NODE_ENV || "development";

    switch (environment) {
      case "production":
        // In Production nur spezifische Domains erlauben
        return [
          "https://yourdomain.com",
          "https://www.yourdomain.com",
          // Weitere Production-URLs hier hinzufügen
        ];

      case "staging":
        return [
          "https://staging.yourdomain.com",
          "http://localhost:3000",
          "http://localhost:3001",
        ];

      case "development":
      default:
        // In Development alle Origins erlauben für einfaches Testing
        return true;
    }
  }

  /**
   * CORS-Middleware für spezifische Entwicklungsumgebung
   * @returns CORS Middleware für Development
   */
  public static getDevCors() {
    const devCorsOptions: CorsOptions = {
      origin: true, // Alle Origins erlauben
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: "*",
      credentials: true,
    };

    return cors(devCorsOptions);
  }

  /**
   * Strenge CORS-Middleware für Production
   * @param allowedOrigins Spezifische erlaubte Origins
   * @returns CORS Middleware für Production
   */
  public static getProductionCors(allowedOrigins: string[]) {
    const prodCorsOptions: CorsOptions = {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      credentials: true,
      maxAge: 86400, // Cache preflight für 24 Stunden
    };

    return cors(prodCorsOptions);
  }
}
