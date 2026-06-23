export type ProductRow = {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price: string | null;
  stock: number;
  image_url: string;
  specs: Record<string, string>;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export function mapCategory(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description
  };
}

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : null,
    stock: row.stock,
    imageUrl: row.image_url,
    specs: row.specs,
    featured: row.featured,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

