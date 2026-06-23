import { query } from "../../db/pool.js";
import { HttpError } from "../../shared/errors.js";

export type CartRow = {
  product_id: number;
  name: string;
  slug: string;
  price: string;
  old_price: string | null;
  stock: number;
  image_url: string;
  quantity: number;
  category_name: string;
  category_slug: string;
};

export function mapCart(rows: CartRow[]) {
  const items = rows.map((row) => {
    const price = Number(row.price);
    const quantity = Number(row.quantity);

    return {
      productId: row.product_id,
      name: row.name,
      slug: row.slug,
      price,
      oldPrice: row.old_price ? Number(row.old_price) : null,
      stock: row.stock,
      imageUrl: row.image_url,
      quantity,
      subtotal: price * quantity,
      category: {
        name: row.category_name,
        slug: row.category_slug
      }
    };
  });

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0)
  };
}

export async function getCart(userId: string) {
  const result = await query<CartRow>(
    `
      SELECT
        p.id AS product_id,
        p.name,
        p.slug,
        p.price,
        p.old_price,
        p.stock,
        p.image_url,
        ci.quantity,
        c.name AS category_name,
        c.slug AS category_slug
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `,
    [userId]
  );

  return mapCart(result.rows);
}

export async function assertProductStock(productId: number, quantity: number) {
  const result = await query<{ stock: number }>("SELECT stock FROM products WHERE id = $1", [productId]);
  const product = result.rows[0];

  if (!product) {
    throw new HttpError(404, "Товар не найден");
  }

  if (product.stock < quantity) {
    throw new HttpError(409, "Недостаточно товара на складе", {
      available: product.stock
    });
  }
}

export async function addCartItem(userId: string, productId: number, quantity: number) {
  const result = await query<{ quantity: number }>(
    `
      INSERT INTO cart_items (user_id, product_id, quantity)
      SELECT $1, p.id, $3
      FROM products p
      WHERE p.id = $2 AND p.stock >= $3
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW()
      WHERE
        cart_items.quantity + EXCLUDED.quantity <= 99
        AND cart_items.quantity + EXCLUDED.quantity <= (
          SELECT stock FROM products WHERE id = EXCLUDED.product_id
        )
      RETURNING quantity
    `,
    [userId, productId, quantity]
  );

  if (result.rowCount) return;

  const productResult = await query<{ stock: number }>("SELECT stock FROM products WHERE id = $1", [productId]);
  const product = productResult.rows[0];

  if (!product) {
    throw new HttpError(404, "Товар не найден");
  }

  throw new HttpError(409, "Нельзя добавить выбранное количество", { available: product.stock });
}

export async function setCartItemQuantity(userId: string, productId: number, quantity: number) {
  const result = await query(
    `
      UPDATE cart_items ci
      SET quantity = $3, updated_at = NOW()
      FROM products p
      WHERE
        ci.user_id = $1
        AND ci.product_id = $2
        AND p.id = ci.product_id
        AND $3 <= p.stock
      RETURNING ci.id
    `,
    [userId, productId, quantity]
  );

  if (result.rowCount) return;

  const resultDetails = await query<{ stock: number; in_cart: boolean }>(
    `
      SELECT p.stock, EXISTS (
        SELECT 1 FROM cart_items WHERE user_id = $1 AND product_id = p.id
      ) AS in_cart
      FROM products p
      WHERE p.id = $2
    `,
    [userId, productId]
  );
  const product = resultDetails.rows[0];

  if (!product) throw new HttpError(404, "Товар не найден");
  if (!product.in_cart) throw new HttpError(404, "Товара нет в корзине");
  throw new HttpError(409, "Недостаточно товара на складе", { available: product.stock });
}
