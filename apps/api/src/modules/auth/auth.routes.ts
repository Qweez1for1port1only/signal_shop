import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearAuthCookieOptions,
  createToken,
  hashPassword,
  verifyPassword
} from "../../shared/auth.js";
import { HttpError, asyncHandler } from "../../shared/errors.js";
import { validateBody } from "../../shared/validation.js";
import { mapUser, type UserRow } from "../users/user.mapper.js";

type UserWithPasswordRow = UserRow & {
  password_hash: string;
};

const registerSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(100),
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(100)
});

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body as z.infer<typeof registerSchema>;
    const passwordHash = await hashPassword(password);
    let result;

    try {
      result = await query<UserRow>(
        `
          INSERT INTO users (email, password_hash, first_name, last_name, phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, email, first_name, last_name, phone, city, address, postal_code, created_at, updated_at
        `,
        [email, passwordHash, firstName, lastName, phone ?? null]
      );
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        throw new HttpError(409, "Пользователь с таким email уже существует");
      }

      throw error;
    }

    const user = mapUser(result.rows[0]);
    const token = createToken({ sub: user.id, email: user.email });

    res.cookie(AUTH_COOKIE, token, authCookieOptions());
    res.status(201).json({ user });
  })
);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const result = await query<UserWithPasswordRow>(
      `
        SELECT id, email, password_hash, first_name, last_name, phone, city, address, postal_code, created_at, updated_at
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    const userRow = result.rows[0];

    if (!userRow) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const isValidPassword = await verifyPassword(password, userRow.password_hash);

    if (!isValidPassword) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const user = mapUser(userRow);
    const token = createToken({ sub: user.id, email: user.email });

    res.cookie(AUTH_COOKIE, token, authCookieOptions());
    res.json({ user });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, clearAuthCookieOptions());
  res.status(204).end();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const result = await query<UserRow>(
      `
        SELECT id, email, first_name, last_name, phone, city, address, postal_code, created_at, updated_at
        FROM users
        WHERE id = $1
      `,
      [authReq.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new HttpError(404, "Аккаунт не найден");
    }

    res.json({ user: mapUser(user) });
  })
);
