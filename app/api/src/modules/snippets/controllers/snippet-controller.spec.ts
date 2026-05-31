import express, { Application } from "express";
import request from "supertest";

import { AppError } from "../../../shared/errors/app-error";
import { errorHandler } from "../../../shared/http/middlewares/error-handler";
import { CreateSnippetService } from "../services/create-snippet-service";
import { DeleteSnippetService } from "../services/delete-snippet-service";
import { GetSnippetService } from "../services/get-snippet-service";
import { ListSnippetsService } from "../services/list-snippets-service";
import { UpdateSnippetService } from "../services/update-snippet-service";
import { snippetRoutes } from "../routes/snippet-routes";
import { SnippetController } from "./snippet-controller";

describe("Snippet routes (integração)", () => {
  let createExecute: jest.Mock;
  let listExecute: jest.Mock;
  let getExecute: jest.Mock;
  let updateExecute: jest.Mock;
  let deleteExecute: jest.Mock;
  let app: Application;

  const validBody = {
    title: "Nginx Security Headers",
    description: "Headers OWASP",
    content: "add_header X-Frame-Options ...",
    type_id: 2,
    tags: [5, 8],
  };

  beforeEach(() => {
    createExecute = jest.fn().mockResolvedValue({ id: 1, filePath: "1.md" });
    listExecute = jest.fn().mockResolvedValue([]);
    getExecute = jest.fn();
    updateExecute = jest.fn().mockResolvedValue(undefined);
    deleteExecute = jest.fn().mockResolvedValue(undefined);

    const controller = new SnippetController(
      { execute: createExecute } as unknown as CreateSnippetService,
      { execute: listExecute } as unknown as ListSnippetsService,
      { execute: getExecute } as unknown as GetSnippetService,
      { execute: updateExecute } as unknown as UpdateSnippetService,
      { execute: deleteExecute } as unknown as DeleteSnippetService,
    );

    app = express();
    app.use(express.json());
    app.use("/api/snippets", snippetRoutes(controller));
    app.use(errorHandler);
  });

  it("POST /api/snippets válido deve retornar 201 e mapear body para o Service", async () => {
    const response = await request(app).post("/api/snippets").send(validBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, filePath: "1.md" });
    expect(createExecute).toHaveBeenCalledWith(
      expect.objectContaining({ typeId: 2, tagIds: [5, 8] }),
    );
  });

  it("POST sem título deve retornar 400 (validação) e não chamar o Service", async () => {
    const response = await request(app)
      .post("/api/snippets")
      .send({ ...validBody, title: "" });

    expect(response.status).toBe(400);
    expect(createExecute).not.toHaveBeenCalled();
  });

  it("GET /api/snippets deve retornar 200 com a lista", async () => {
    const response = await request(app).get("/api/snippets?typeId=2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(listExecute).toHaveBeenCalledWith(
      expect.objectContaining({ typeId: 2 }),
    );
  });

  it("GET /api/snippets/:id inexistente deve retornar 404", async () => {
    getExecute.mockRejectedValueOnce(new AppError("Snippet não encontrado.", 404));

    const response = await request(app).get("/api/snippets/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Snippet não encontrado." });
  });

  it("GET /api/snippets/:id com id inválido deve retornar 400", async () => {
    const response = await request(app).get("/api/snippets/abc");

    expect(response.status).toBe(400);
    expect(getExecute).not.toHaveBeenCalled();
  });

  it("DELETE /api/snippets/:id deve retornar 204", async () => {
    const response = await request(app).delete("/api/snippets/1");

    expect(response.status).toBe(204);
    expect(deleteExecute).toHaveBeenCalledWith(1);
  });
});
