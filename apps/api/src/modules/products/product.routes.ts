import { Router } from "express";
import { z } from "zod";
import { query } from "../../db/pool.js";
import { HttpError, asyncHandler } from "../../shared/errors.js";
import { validateQuery } from "../../shared/validation.js";
import { mapCategory, mapProduct, type CategoryRow, type ProductRow } from "./product.mapper.js";

const productQuerySchema = z.object({
  category: z.string().trim().max(140).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["popular", "price_asc", "price_desc", "name"]).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  page: z.coerce.number().int().min(1).default(1)
});

export const productRouter = Router();

productRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const result = await query<CategoryRow>(
      "SELECT id, name, slug, description FROM categories ORDER BY name"
    );

    res.json({ categories: result.rows.map(mapCategory) });
  })
);

productRouter.get(
  "/products",
  validateQuery(productQuerySchema),
  asyncHandler(async (req, res) => {
    const filters = req.query as unknown as z.infer<typeof productQuerySchema>;
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.category) {
      values.push(filters.category);
      conditions.push(`c.slug = $${values.length}`);
    }

    if (filters.q) {
      values.push(filters.q);
      conditions.push(
        `to_tsvector('russian', p.name || ' ' || p.description) @@ websearch_to_tsquery('russian', $${values.length})`
      );
    }

    if (filters.featured) {
      values.push(filters.featured === "true");
      conditions.push(`p.featured = $${values.length}`);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderSql = {
      popular: "p.featured DESC, p.created_at DESC",
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
      name: "p.name ASC"
    }[filters.sort ?? "popular"];

    values.push(filters.limit);
    const limitIndex = values.length;
    values.push((filters.page - 1) * filters.limit);
    const offsetIndex = values.length;

    const [productsResult, countResult] = await Promise.all([
      query<ProductRow>(
        `
          SELECT
            p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
            p.name, p.slug, p.description, p.price, p.old_price, p.stock,
            p.image_url, p.specs, p.featured, p.created_at, p.updated_at
          FROM products p
          JOIN categories c ON c.id = p.category_id
          ${whereSql}
          ORDER BY ${orderSql}
          LIMIT $${limitIndex} OFFSET $${offsetIndex}
        `,
        values
      ),
      query<{ count: string }>(
        `
          SELECT COUNT(*)::int AS count
          FROM products p
          JOIN categories c ON c.id = p.category_id
          ${whereSql}
        `,
        values.slice(0, values.length - 2)
      )
    ]);

    res.json({
      products: productsResult.rows.map(mapProduct),
      page: filters.page,
      limit: filters.limit,
      total: Number(countResult.rows[0].count)
    });
  })
);

productRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const result = await query<ProductRow>(
      `
        SELECT
          p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
          p.name, p.slug, p.description, p.price, p.old_price, p.stock,
          p.image_url, p.specs, p.featured, p.created_at, p.updated_at
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.slug = $1
      `,
      [req.params.slug]
    );

    const product = result.rows[0];

    if (!product) {
      throw new HttpError(404, "Товар не найден");
    }

    res.json({ product: mapProduct(product) });
  })
);
