import bcrypt from "bcryptjs";
import { pool, withTransaction } from "./pool.js";

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
};

type ProductSeed = {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  imageUrl: string;
  featured: boolean;
  specs: Record<string, string>;
};

const categories: CategorySeed[] = [
  {
    name: "Ноутбуки",
    slug: "laptops",
    description: "Модели для учёбы, работы, дизайна и игр."
  },
  {
    name: "Смартфоны",
    slug: "smartphones",
    description: "Флагманы и практичные устройства на каждый день."
  },
  {
    name: "Аудио",
    slug: "audio",
    description: "Наушники, колонки и аксессуары для чистого звука."
  },
  {
    name: "Аксессуары",
    slug: "accessories",
    description: "Зарядки, клавиатуры, мыши и полезные дополнения."
  }
];

const products: ProductSeed[] = [
  {
    categorySlug: "laptops",
    name: "Apple MacBook Air 13 M3",
    slug: "apple-macbook-air-13-m3",
    description: "Тонкий ноутбук с бесшумным охлаждением, ярким дисплеем Liquid Retina и долгой автономностью.",
    price: 109990,
    oldPrice: 119990,
    stock: 12,
    imageUrl: "/products/macbook-air.webp",
    featured: true,
    specs: {
      processor: "Apple M3",
      memory: "16 ГБ",
      storage: "512 ГБ SSD",
      screen: "13.6 Liquid Retina"
    }
  },
  {
    categorySlug: "laptops",
    name: "Lenovo Legion Slim 5",
    slug: "lenovo-legion-slim-5",
    description: "Игровой ноутбук в тонком корпусе с дискретной графикой и эффективным охлаждением.",
    price: 139990,
    stock: 7,
    imageUrl: "/products/lenovo-legion-slim-5.webp",
    featured: true,
    specs: {
      processor: "AMD Ryzen 7",
      memory: "32 ГБ",
      storage: "1 ТБ SSD",
      graphics: "GeForce RTX 4060"
    }
  },
  {
    categorySlug: "smartphones",
    name: "Samsung Galaxy S25",
    slug: "samsung-galaxy-s25",
    description: "Компактный смартфон с ярким экраном, защитой корпуса и производительной камерой.",
    price: 89990,
    stock: 18,
    imageUrl: "/products/galaxy-s25.webp",
    featured: true,
    specs: {
      display: "6.2 AMOLED",
      memory: "12 ГБ",
      storage: "256 ГБ",
      camera: "50 Мп"
    }
  },
  {
    categorySlug: "smartphones",
    name: "Xiaomi Redmi Note 14 Pro",
    slug: "xiaomi-redmi-note-14-pro",
    description: "Смартфон среднего класса с ёмким аккумулятором и быстрой зарядкой.",
    price: 32990,
    oldPrice: 36990,
    stock: 25,
    imageUrl: "/products/redmi-note-14-pro.webp",
    featured: false,
    specs: {
      display: "6.67 AMOLED",
      memory: "8 ГБ",
      storage: "256 ГБ",
      battery: "5100 мАч"
    }
  },
  {
    categorySlug: "audio",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "Беспроводные наушники с активным шумоподавлением и мягкой посадкой.",
    price: 37990,
    stock: 14,
    imageUrl: "/products/sony-wh-1000xm5.webp",
    featured: true,
    specs: {
      connection: "Bluetooth 5.2",
      battery: "до 30 часов",
      noiseCanceling: "активное",
      weight: "250 г"
    }
  },
  {
    categorySlug: "audio",
    name: "JBL Charge 5",
    slug: "jbl-charge-5",
    description: "Портативная колонка с влагозащитой и мощным звучанием для поездок и дома.",
    price: 15990,
    stock: 21,
    imageUrl: "/products/jbl-charge-5.webp",
    featured: false,
    specs: {
      power: "40 Вт",
      battery: "до 20 часов",
      protection: "IP67",
      charging: "USB-C"
    }
  },
  {
    categorySlug: "accessories",
    name: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    description: "Тихая эргономичная мышь для работы с документами, кодом и графикой.",
    price: 10990,
    stock: 32,
    imageUrl: "/products/mx-master-3s.webp",
    featured: false,
    specs: {
      dpi: "8000",
      connection: "Bluetooth / USB",
      battery: "до 70 дней",
      buttons: "7"
    }
  },
  {
    categorySlug: "accessories",
    name: "Baseus GaN3 Pro 65W",
    slug: "baseus-gan-65w",
    description: "Компактное зарядное устройство для ноутбука, смартфона и наушников.",
    price: 4990,
    oldPrice: 5990,
    stock: 40,
    imageUrl: "/products/baseus-gan3.webp",
    featured: false,
    specs: {
      power: "65 Вт",
      ports: "2 USB-C, 2 USB-A",
      technology: "GaN",
      cable: "в комплекте"
    }
  }
];

async function seed() {
  await withTransaction(async (client) => {
    for (const category of categories) {
      await client.query(
        `
          INSERT INTO categories (name, slug, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (slug)
          DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
        `,
        [category.name, category.slug, category.description]
      );
    }

    for (const product of products) {
      const categoryResult = await client.query<{ id: number }>(
        "SELECT id FROM categories WHERE slug = $1",
        [product.categorySlug]
      );

      const categoryId = categoryResult.rows[0]?.id;

      if (!categoryId) {
        throw new Error(`Category not found: ${product.categorySlug}`);
      }

      await client.query(
        `
          INSERT INTO products (
            category_id, name, slug, description, price, old_price, stock, image_url, featured, specs
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (slug)
          DO UPDATE SET
            category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            old_price = EXCLUDED.old_price,
            stock = EXCLUDED.stock,
            image_url = EXCLUDED.image_url,
            featured = EXCLUDED.featured,
            specs = EXCLUDED.specs
        `,
        [
          categoryId,
          product.name,
          product.slug,
          product.description,
          product.price,
          product.oldPrice ?? null,
          product.stock,
          product.imageUrl,
          product.featured,
          JSON.stringify(product.specs)
        ]
      );
    }

    const passwordHash = await bcrypt.hash("Student12345", 10);

    await client.query(
      `
        INSERT INTO users (email, password_hash, first_name, last_name, phone, city, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email)
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          phone = EXCLUDED.phone,
          city = EXCLUDED.city,
          address = EXCLUDED.address
      `,
      [
        "student@example.com",
        passwordHash,
        "Иван",
        "Петров",
        "+7 900 555-35-35",
        "Москва",
        "ул. Тверская, 15"
      ]
    );
  });

  await pool.end();
  console.log("Seed data is ready");
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
