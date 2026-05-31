import express, { Application } from "express";

import { errorHandler } from "./middlewares/error-handler";
import { router } from "./routes";

/**
 * Monta a aplicação Express SEM dar `listen`.
 *
 * Separar a criação do app do `server.ts` permite que os testes de
 * integração (supertest) importem `app` diretamente, sem abrir uma porta.
 */
const app: Application = express();

app.use(express.json());
app.use(router);

// Middleware de erro central — deve ser o último registrado.
app.use(errorHandler);

export { app };
