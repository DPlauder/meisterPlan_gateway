import { App } from "./App";

console.log("Starte Gateway...");

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

try {
  const appInstance = App.getInstance();
  const server = appInstance.getApp().listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
  });

  server.on("error", (error: any) => {
    console.error("Server Error:", error);
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} ist bereits in Verwendung`);
    }
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM empfangen, Server wird heruntergefahren...");
    server.close(() => {
      App.resetInstance();
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT empfangen, Server wird heruntergefahren...");
    server.close(() => {
      App.resetInstance();
      process.exit(0);
    });
  });
} catch (error) {
  console.error("Fehler beim Starten des Servers:", error);
  process.exit(1);
}
