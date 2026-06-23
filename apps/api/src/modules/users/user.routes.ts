import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { HttpError, asyncHandler } from "../../shared/errors.js";
import { validateBody } from "../../shared/validation.js";
import { mapUser, type UserRow } from "./user.mapper.js";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional()
});

export const userRouter = Router();

userRouter.patch(
  "/me",
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const body = req.body as z.infer<typeof updateProfileSchema>;

    const result = await query<UserRow>(
      `
        UPDATE users
        SET
          first_name = $2,
          last_name = $3,
          phone = $4,
          city = $5,
          address = $6,
          postal_code = $7,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, phone, city, address, postal_code, created_at, updated_at
      `,
      [
        authReq.user.id,
        body.firstName,
        body.lastName,
        body.phone ?? null,
        body.city ?? null,
        body.address ?? null,
        body.postalCode ?? null
      ]
    );

    const user = result.rows[0];

    if (!user) {
      throw new HttpError(404, "Аккаунт не найден");
    }

    res.json({ user: mapUser(user) });
  })
);
