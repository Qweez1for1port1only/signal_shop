import type { Request, RequestHandler } from "express";
import { HttpError } from "../shared/errors.js";
import { AUTH_COOKIE, readToken } from "../shared/auth.js";

export type RequestUser = {
  id: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: RequestUser;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = req.cookies?.[AUTH_COOKIE] ?? bearerToken;

  if (!token) {
    next(new HttpError(401, "Необходимо войти в аккаунт"));
    return;
  }

  try {
    const payload = readToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email
    };
    next();
  } catch {
    next(new HttpError(401, "Сессия недействительна"));
  }
};
