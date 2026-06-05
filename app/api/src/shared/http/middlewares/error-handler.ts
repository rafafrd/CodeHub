import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../errors/app-error";

/**
 * Middleware de erro central (4 argumentos — exigência do Express).
 * Traduz erros de domínio (`AppError`) e de validação (`ZodError`) em
 * respostas HTTP adequadas; o resto vira 500.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Falha de validação.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor." });
}
