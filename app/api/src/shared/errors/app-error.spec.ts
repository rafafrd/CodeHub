import { AppError } from "./app-error";

describe("AppError", () => {
  it("deve usar o statusCode 400 por padrão", () => {
    const error = new AppError("falha de validação");

    expect(error.message).toBe("falha de validação");
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(Error);
  });

  it("deve permitir definir um statusCode customizado", () => {
    const error = new AppError("não encontrado", 404);

    expect(error.statusCode).toBe(404);
  });
});
