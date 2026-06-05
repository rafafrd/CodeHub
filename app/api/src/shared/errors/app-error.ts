/**
 * Erro de domínio do CodeHub.
 *
 * Carrega um `statusCode` HTTP para que o middleware de erro (a ser
 * adicionado na camada HTTP) possa traduzir falhas de negócio em respostas
 * adequadas (400, 404, etc.) sem que os Services conheçam o Express.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;

    // Mantém a cadeia de protótipos correta ao estender Error em TS.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
