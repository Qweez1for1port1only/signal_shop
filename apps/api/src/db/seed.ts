import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
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
  previousSlug?: string;
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
    previousSlug: "acer-swift-go-14",
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
  },
  {
    categorySlug: "laptops",
    name: "ASUS Zenbook 14 OLED",
    slug: "asus-zenbook-14-oled",
    description: "Компактный ноутбук в алюминиевом корпусе с OLED-дисплеем и быстрым накопителем на 1 ТБ.",
    price: 99990,
    stock: 10,
    imageUrl: "/products/zenbook-14.webp",
    featured: true,
    specs: {
      processor: "Intel Core Ultra 7",
      memory: "16 ГБ",
      storage: "1 ТБ SSD",
      screen: "14 OLED 3K"
    }
  },
  {
    categorySlug: "smartphones",
    name: "Apple iPhone 16",
    slug: "apple-iphone-16",
    description: "Смартфон с процессором A18, камерой 48 Мп и удобной кнопкой управления съёмкой.",
    price: 99990,
    stock: 20,
    imageUrl: "/products/iphone-16.webp",
    featured: true,
    specs: {
      display: "6.1 Super Retina XDR",
      processor: "Apple A18",
      storage: "256 ГБ",
      camera: "48 Мп"
    }
  },
  {
    categorySlug: "smartphones",
    name: "Google Pixel 9",
    slug: "google-pixel-9",
    description: "Компактный смартфон Google с чистым Android, ярким OLED-экраном и камерой 50 Мп.",
    price: 79990,
    oldPrice: 84990,
    stock: 13,
    imageUrl: "/products/pixel-9.webp",
    featured: false,
    specs: {
      display: "6.3 OLED 120 Гц",
      processor: "Google Tensor G4",
      storage: "256 ГБ",
      camera: "50 Мп"
    }
  },
  {
    categorySlug: "audio",
    name: "Apple AirPods 4",
    slug: "apple-airpods-4",
    description: "Компактные беспроводные наушники с пространственным аудио и зарядным футляром USB-C.",
    price: 19990,
    stock: 22,
    imageUrl: "/products/airpods-4.webp",
    featured: false,
    specs: {
      connection: "Bluetooth 5.3",
      chip: "Apple H2",
      charging: "USB-C",
      protection: "IP54"
    }
  },
  {
    categorySlug: "audio",
    name: "Marshall Emberton II",
    slug: "marshall-emberton-ii",
    description: "Портативная стереоколонка с фирменным дизайном, защитой IP67 и автономностью более 30 часов.",
    price: 17990,
    stock: 16,
    imageUrl: "/products/emberton-ii.webp",
    featured: false,
    specs: {
      connection: "Bluetooth 5.1",
      battery: "более 30 часов",
      protection: "IP67",
      weight: "700 г"
    }
  },
  {
    categorySlug: "accessories",
    name: "Keychron K2 Pro",
    slug: "keychron-k2-pro",
    description: "Беспроводная механическая клавиатура формата 75% с поддержкой QMK/VIA и горячей заменой свитчей.",
    price: 14990,
    stock: 17,
    imageUrl: "/products/keychron-k2-pro.webp",
    featured: false,
    specs: {
      layout: "75%",
      connection: "Bluetooth / USB-C",
      switches: "hot-swap",
      battery: "4000 мАч"
    }
  }
];

const seedVersion = "001_catalog";

export async function seedDatabase() {
  const seeded = await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["signal-store-seed"]);
    await client.exec(`
      CREATE TABLE IF NOT EXISTS seed_versions (
        version VARCHAR(120) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const applied = await client.query<{ version: string }>(
      "SELECT version FROM seed_versions WHERE version = $1",
      [seedVersion]
    );

    if (applied.rows[0]) return false;

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

      if (product.previousSlug && product.previousSlug !== product.slug) {
        await client.query(
          `
            UPDATE products
            SET slug = $2
            WHERE slug = $1 AND NOT EXISTS (SELECT 1 FROM products WHERE slug = $2)
          `,
          [product.previousSlug, product.slug]
        );
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

    await client.query("INSERT INTO seed_versions (version) VALUES ($1)", [seedVersion]);
    return true;
  });

  console.log(seeded ? "Seed data is ready" : "Seed data is already ready");
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  seedDatabase()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
