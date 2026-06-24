import { Router } from "express";
import { z } from "zod";
import { withTransaction } from "../../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { paymentCardSchema } from "../../shared/card.js";
import { asyncHandler } from "../../shared/errors.js";
import { validateBody, validateParams, validateQuery } from "../../shared/validation.js";
import { createCheckout, getOrder, listOrders } from "./order.service.js";

const checkoutSchema = z.object({
  deliveryAddress: z.object({
    fullName: z.string().min(3).max(180),
    phone: z.string().min(6).max(40),
    city: z.string().min(2).max(120),
    address: z.string().min(5).max(500),
    postalCode: z.string().max(20).nullable().optional()
  }),
  card: paymentCardSchema,
  idempotencyKey: z.string().uuid()
});

const orderParamsSchema = z.object({ id: z.string().uuid() });
const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const orderRouter = Router();

orderRouter.use("/orders", requireAuth);
orderRouter.use("/checkout", requireAuth);

orderRouter.get(
  "/orders",
  validateQuery(orderListQuerySchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const filters = req.query as unknown as z.infer<typeof orderListQuerySchema>;
    res.json(await listOrders(authReq.user.id, filters.page, filters.limit));
  })
);

orderRouter.get(
  "/orders/:id",
  validateParams(orderParamsSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    res.json({ order: await getOrder(authReq.user.id, req.params.id) });
  })
);

orderRouter.post(
  "/checkout",
  validateBody(checkoutSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const body = req.body as z.infer<typeof checkoutSchema>;
    const checkout = await withTransaction((client) =>
      createCheckout(client, authReq.user.id, body.deliveryAddress, body.card, body.idempotencyKey)
    );
    const order = await getOrder(authReq.user.id, checkout.orderId);

    if (!checkout.paid) {
      res.status(402).json({ message: checkout.message, order });
      return;
    }

    res.status(201).json({ message: checkout.message, order });
  })
);
