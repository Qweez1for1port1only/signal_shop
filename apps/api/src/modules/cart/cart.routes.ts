import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/errors.js";
import { validateBody, validateParams } from "../../shared/validation.js";
import { addCartItem, getCart, setCartItemQuantity } from "./cart.service.js";

const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99).default(1)
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99)
});

const productIdParamsSchema = z.object({
  productId: z.coerce.number().int().positive()
});

export const cartRouter = Router();

cartRouter.use("/cart", requireAuth);

cartRouter.get(
  "/cart",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    res.json({ cart: await getCart(authReq.user.id) });
  })
);

cartRouter.post(
  "/cart/items",
  validateBody(cartItemSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { productId, quantity } = req.body as z.infer<typeof cartItemSchema>;
    await addCartItem(authReq.user.id, productId, quantity);

    res.status(201).json({ cart: await getCart(authReq.user.id) });
  })
);

cartRouter.patch(
  "/cart/items/:productId",
  validateParams(productIdParamsSchema),
  validateBody(updateCartItemSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const productId = Number(req.params.productId);
    const { quantity } = req.body as z.infer<typeof updateCartItemSchema>;

    if (quantity === 0) {
      await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [
        authReq.user.id,
        productId
      ]);
      res.json({ cart: await getCart(authReq.user.id) });
      return;
    }

    await setCartItemQuantity(authReq.user.id, productId, quantity);

    res.json({ cart: await getCart(authReq.user.id) });
  })
);

cartRouter.delete(
  "/cart/items/:productId",
  validateParams(productIdParamsSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [
      authReq.user.id,
      Number(req.params.productId)
    ]);

    res.json({ cart: await getCart(authReq.user.id) });
  })
);

cartRouter.delete(
  "/cart",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    await query("DELETE FROM cart_items WHERE user_id = $1", [authReq.user.id]);
    res.json({ cart: await getCart(authReq.user.id) });
  })
);
