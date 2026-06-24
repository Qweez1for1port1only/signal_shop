import type pg from "pg";
import { query } from "../../db/pool.js";
import { HttpError } from "../../shared/errors.js";
import { mapOrder, type OrderItemRow, type OrderRow } from "./order.mapper.js";

type CartCheckoutRow = {
  product_id: number;
  name: string;
  price: string;
  stock: number;
  quantity: number;
};

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode?: string | null;
};

export type CardInput = {
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
};

export async function getOrder(userId: string, orderId: string) {
  const orderResult = await query<OrderRow>(
    `
      SELECT
        o.id, o.status, o.total_amount, o.delivery_address, o.created_at, o.updated_at,
        p.id AS payment_id, p.status AS payment_status, p.provider AS payment_provider,
        p.card_last4, p.paid_at
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = $1 AND o.id = $2
    `,
    [userId, orderId]
  );

  const order = orderResult.rows[0];

  if (!order) {
    throw new HttpError(404, "Заказ не найден");
  }

  const itemsResult = await query<OrderItemRow>(
    `
      SELECT id, product_id, product_name, unit_price, quantity, subtotal
      FROM order_items
      WHERE order_id = $1
      ORDER BY id
    `,
    [orderId]
  );

  return mapOrder(order, itemsResult.rows);
}

export async function listOrders(userId: string, page = 1, limit = 20) {
  const [result, countResult] = await Promise.all([
    query<OrderRow>(
    `
      SELECT
        o.id, o.status, o.total_amount, o.delivery_address, o.created_at, o.updated_at,
        p.id AS payment_id, p.status AS payment_status, p.provider AS payment_provider,
        p.card_last4, p.paid_at
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, (page - 1) * limit]
    ),
    query<{ count: string }>("SELECT COUNT(*)::int AS count FROM orders WHERE user_id = $1", [userId])
  ]);

  const orderIds = result.rows.map((order) => order.id);

  if (!orderIds.length) {
    return { orders: [], page, limit, total: Number(countResult.rows[0].count) };
  }

  const itemsResult = await query<OrderItemRow>(
    `
      SELECT order_id, id, product_id, product_name, unit_price, quantity, subtotal
      FROM order_items
      WHERE order_id = ANY($1::uuid[])
      ORDER BY id
    `,
    [orderIds]
  );

  const itemsByOrder = new Map<string, OrderItemRow[]>();

  for (const item of itemsResult.rows) {
    if (!item.order_id) continue;
    const items = itemsByOrder.get(item.order_id) ?? [];
    items.push(item);
    itemsByOrder.set(item.order_id, items);
  }

  return {
    orders: result.rows.map((order) => mapOrder(order, itemsByOrder.get(order.id) ?? [])),
    page,
    limit,
    total: Number(countResult.rows[0].count)
  };
}

export async function createCheckout(
  client: pg.PoolClient,
  userId: string,
  deliveryAddress: DeliveryAddress,
  card: CardInput,
  idempotencyKey: string
) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);

  const existingResult = await client.query<{
    id: string;
    status: string;
    payment_status: string | null;
    error_message: string | null;
  }>(
    `
      SELECT o.id, o.status, p.status AS payment_status, p.error_message
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = $1 AND o.idempotency_key = $2
    `,
    [userId, idempotencyKey]
  );
  const existing = existingResult.rows[0];

  if (existing) {
    const paid = existing.status === "paid" && existing.payment_status === "succeeded";
    return {
      orderId: existing.id,
      paid,
      message: paid ? "Заказ успешно оплачен" : existing.error_message ?? "Платёж не выполнен"
    };
  }

  const cartResult = await client.query<CartCheckoutRow>(
    `
      SELECT p.id AS product_id, p.name, p.price, p.stock, ci.quantity
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at
      FOR UPDATE OF p
    `,
    [userId]
  );

  const cartItems = cartResult.rows;

  if (!cartItems.length) {
    throw new HttpError(400, "Корзина пуста");
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      throw new HttpError(409, `Недостаточно товара: ${item.name}`, {
        productId: item.product_id,
        available: item.stock
      });
    }
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const orderResult = await client.query<{ id: string }>(
    `
      INSERT INTO orders (user_id, idempotency_key, status, total_amount, delivery_address)
      VALUES ($1, $2, 'pending', $3, $4)
      RETURNING id
    `,
    [userId, idempotencyKey, total, JSON.stringify(deliveryAddress)]
  );

  const orderId = orderResult.rows[0].id;

  for (const item of cartItems) {
    const unitPrice = Number(item.price);
    await client.query(
      `
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [orderId, item.product_id, item.name, unitPrice, item.quantity, unitPrice * item.quantity]
    );
  }

  const cardDigits = card.number.replace(/\D/g, "");
  const cardLast4 = cardDigits.slice(-4);
  const paymentFailed = cardDigits.endsWith("0000") || card.cvc === "000";

  if (paymentFailed) {
    await client.query(
      `
        INSERT INTO payments (order_id, status, amount, card_last4, error_message)
        VALUES ($1, 'failed', $2, $3, $4)
      `,
      [orderId, total, cardLast4, "Банк отклонил демонстрационный платеж"]
    );

    await client.query("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1", [
      orderId
    ]);

    return {
      orderId,
      paid: false,
      message: "Платёж отклонён. Проверьте реквизиты или используйте другую демо-карту"
    };
  }

  for (const item of cartItems) {
    await client.query("UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1", [
      item.product_id,
      item.quantity
    ]);
  }

  await client.query(
    `
      INSERT INTO payments (order_id, status, amount, card_last4, paid_at)
      VALUES ($1, 'succeeded', $2, $3, NOW())
    `,
    [orderId, total, cardLast4]
  );

  await client.query("UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1", [orderId]);
  await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

  return {
    orderId,
    paid: true,
    message: "Заказ успешно оплачен"
  };
}
