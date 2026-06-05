import express, { Application } from "express";
import request from "supertest";

import { AppError } from "../../../shared/errors/app-error";
import { errorHandler } from "../../../shared/http/middlewares/error-handler";
import { CreateProjectTypeService } from "../services/create-project-type-service";
import { DeleteProjectTypeService } from "../services/delete-project-type-service";
import { ListProjectTypesService } from "../services/list-project-types-service";
import { UpdateProjectTypeService } from "../services/update-project-type-service";
import { projectTypeRoutes } from "../routes/project-type-routes";
import { ProjectTypeController } from "./project-type-controller";

describe("ProjectType routes (integração)", () => {
  let createExecute: jest.Mock;
  let listExecute: jest.Mock;
  let updateExecute: jest.Mock;
  let deleteExecute: jest.Mock;
  let app: Application;

  beforeEach(() => {
    createExecute = jest.fn().mockResolvedValue({ id: 1, name: "DevSecOps" });
    listExecute = jest.fn().mockResolvedValue([{ id: 1, name: "DevSecOps" }]);
    updateExecute = jest.fn().mockResolvedValue(undefined);
    deleteExecute = jest.fn().mockResolvedValue(undefined);

    const controller = new ProjectTypeController(
      { execute: createExecute } as unknown as CreateProjectTypeService,
      { execute: listExecute } as unknown as ListProjectTypesService,
      { execute: updateExecute } as unknown as UpdateProjectTypeService,
      { execute: deleteExecute } as unknown as DeleteProjectTypeService,
    );

    app = express();
    app.use(express.json());
    app.use("/api/types", projectTypeRoutes(controller));
    app.use(errorHandler);
  });

  it("POST válido deve retornar 201", async () => {
    const response = await request(app)
      .post("/api/types")
      .send({ name: "DevSecOps" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, name: "DevSecOps" });
  });

  it("POST sem nome deve retornar 400", async () => {
    const response = await request(app).post("/api/types").send({ name: "" });

    expect(response.status).toBe(400);
    expect(createExecute).not.toHaveBeenCalled();
  });

  it("GET deve retornar 200 com a lista", async () => {
    const response = await request(app).get("/api/types");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("POST com nome duplicado deve retornar 409", async () => {
    createExecute.mockRejectedValueOnce(
      new AppError("Já existe um tipo com esse nome.", 409),
    );

    const response = await request(app)
      .post("/api/types")
      .send({ name: "DevSecOps" });

    expect(response.status).toBe(409);
  });

  it("DELETE deve retornar 204", async () => {
    const response = await request(app).delete("/api/types/1");

    expect(response.status).toBe(204);
    expect(deleteExecute).toHaveBeenCalledWith(1);
  });
});
