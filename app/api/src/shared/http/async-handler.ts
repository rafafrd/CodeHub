import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Encapsula handlers assíncronos para que erros lançados (incl. `AppError` e
 * `ZodError`) sejam encaminhados ao middleware de erro central — o Express 4
 * não captura rejeições de Promise automaticamente.
 */
export function asyncHandler(handler: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
