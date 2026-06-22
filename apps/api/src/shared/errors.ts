import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export const asyncHandler = (
  handler: (...args: Parameters<RequestHandler>) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, "Маршрут не найден"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Проверьте правильность заполнения формы",
      errors: error.flatten()
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ message: "Некорректный JSON в теле запроса" });
    return;
  }

  if (typeof error === "object" && error && "type" in error && error.type === "entity.too.large") {
    res.status(413).json({ message: "Тело запроса слишком большое" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
};
