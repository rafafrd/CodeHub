import "dotenv/config";

import { closeDb } from "../../database/sqlite";
import { app } from "./app";

const port = Number(process.env.PORT) || 3333;

const server = app.listen(port, () => {
  console.info(`🚀 CodeHub API rodando em http://localhost:${port}`);
});

// Shutdown gracioso: fecha o SQLite para deixar o arquivo limpo p/ commit.
function shutdown(): void {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
