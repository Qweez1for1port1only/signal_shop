import bcrypt from "bcryptjs";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

export const AUTH_COOKIE = "signal_session";

export type TokenPayload = {
  sub: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function readToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
}

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export function clearAuthCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...options } = authCookieOptions();
  return options;
}
