import express, { Application } from "express";
import request from "supertest";

import { AppError } from "../../../shared/errors/app-error";
import { errorHandler } from "../../../shared/http/middlewares/error-handler";
import { CreateTagService } from "../services/create-tag-service";
import { DeleteTagService } from "../services/delete-tag-service";
import { ListTagsService } from "../services/list-tags-service";
import { UpdateTagService } from "../services/update-tag-service";
import { tagRoutes } from "../routes/tag-routes";
import { TagController } from "./tag-controller";

describe("Tag routes (integração)", () => {
  let createExecute: jest.Mock;
  let listExecute: jest.Mock;
  let updateExecute: jest.Mock;
  let deleteExecute: jest.Mock;
  let app: Application;

  beforeEach(() => {
    createExecute = jest.fn().mockResolvedValue({ id: 1, name: "nginx" });
    listExecute = jest.fn().mockResolvedValue([{ id: 1, name: "nginx" }]);
    updateExecute = jest.fn().mockResolvedValue(undefined);
    deleteExecute = jest.fn().mockResolvedValue(undefined);

    const controller = new TagController(
      { execute: createExecute } as unknown as CreateTagService,
      { execute: listExecute } as unknown as ListTagsService,
      { execute: updateExecute } as unknown as UpdateTagService,
      { execute: deleteExecute } as unknown as DeleteTagService,
    );

    app = express();
    app.use(express.json());
    app.use("/api/tags", tagRoutes(controller));
    app.use(errorHandler);
  });

  it("POST válido deve retornar 201", async () => {
    const response = await request(app).post("/api/tags").send({ name: "nginx" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, name: "nginx" });
  });

  it("POST sem nome deve retornar 400", async () => {
    const response = await request(app).post("/api/tags").send({ name: "" });

    expect(response.status).toBe(400);
    expect(createExecute).not.toHaveBeenCalled();
  });

  it("GET deve retornar 200 com a lista", async () => {
    const response = await request(app).get("/api/tags");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("PUT inexistente deve retornar 404", async () => {
    updateExecute.mockRejectedValueOnce(new AppError("Tag não encontrada.", 404));

    const response = await request(app)
      .put("/api/tags/99")
      .send({ name: "nginx" });

    expect(response.status).toBe(404);
  });

  it("DELETE deve retornar 204", async () => {
    const response = await request(app).delete("/api/tags/1");

    expect(response.status).toBe(204);
    expect(deleteExecute).toHaveBeenCalledWith(1);
  });
});
