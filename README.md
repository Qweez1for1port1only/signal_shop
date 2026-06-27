# Signal Shop

Signal Shop — учебный интернет-магазин техники, разработанный в рамках производственной практики по веб-разработке.

В проекте реализованы каталог товаров, поиск и фильтрация, страницы отдельных товаров, регистрация и авторизация, корзина, оформление заказа и личный кабинет с историей заказов.

## Деплой

Проект доступен по адресу:

https://signal-shop.vercel.app/

Frontend и API размещены на Vercel. Для хранения данных в production используется PostgreSQL от Neon.

## Тестовый пользователь

Для проверки авторизации можно использовать готовый аккаунт:

```text
Email: student@example.com
Пароль: Student12345
```

Тестовые данные для успешной оплаты:

```text
Номер карты: 4242 4242 4242 4242
Владелец: IVAN PETROV
Срок действия: 12/30
CVC: 123
```

Для имитации отклонённого платежа можно указать `CVC: 000`.

## Основной функционал

- просмотр главной страницы и популярных товаров;
- просмотр каталога;
- поиск, фильтрация и сортировка товаров;
- просмотр страницы отдельного товара;
- регистрация и авторизация пользователя;
- выход из аккаунта и восстановление сессии;
- редактирование профиля;
- добавление товаров в корзину;
- изменение количества и удаление товаров из корзины;
- проверка доступного остатка;
- оформление и демонстрационная оплата заказа;
- просмотр истории и состава заказов;
- адаптивный интерфейс для разных размеров экрана.

## Стек технологий

### Frontend

- Vue 3;
- TypeScript;
- Vue Router;
- Pinia;
- Vite;
- Tailwind CSS;
- Lucide Icons.

### Backend

- Node.js;
- Express;
- TypeScript;
- JWT;
- HTTP-only cookie-аутентификация;
- Zod;
- bcrypt;
- Helmet;
- CORS;
- express-rate-limit.

### База данных и инфраструктура

- PGlite для локальной разработки;
- Neon PostgreSQL для production;
- SQL-схема с пользователями, категориями, товарами, корзинами, заказами и платежами;
- Vercel Functions для API;
- GitHub Actions для проверки типов, тестов и сборки.

## Структура проекта

```text
.
├── api/
│   └── index.ts              # входная точка Vercel Function
├── apps/
│   ├── api/                  # Express API и слой базы данных
│   │   ├── src/
│   │   └── test/
│   └── web/                  # Vue-приложение
│       ├── public/
│       └── src/
├── .github/
│   └── workflows/
│       └── ci.yml            # автоматические проверки GitHub Actions
├── package.json              # общие команды npm workspaces
└── vercel.json               # настройки production-деплоя
```

## Локальный запуск

### Требования

- Node.js версии `20.19–24.x`;
- npm.

Docker и отдельная установка PostgreSQL не требуются. Локальная база создаётся автоматически при первом запуске и заполняется тестовыми товарами.

### Установка и запуск

```bash
git clone https://github.com/Qweez1for1port1only/signal_shop.git
cd signal_shop
npm install
npm run dev
```

После запуска будут доступны:

- frontend: http://localhost:5173
- API: http://localhost:4000

Для остановки серверов нажмите `Ctrl+C`.

## Команды

```bash
npm run dev       # одновременно запустить frontend и API
npm run dev:web   # запустить только frontend
npm run dev:api   # запустить только API
npm run lint      # проверить TypeScript
npm test          # запустить тесты
npm run build     # собрать весь проект
npm run db:setup  # создать структуру локальной базы
npm run db:seed   # добавить тестовые данные
```

## Основные страницы

- `/` — главная страница;
- `/catalog` — каталог товаров;
- `/catalog/:slug` — страница товара;
- `/login` — вход;
- `/register` — регистрация;
- `/cart` — корзина;
- `/checkout` — оформление заказа;
- `/account` — профиль и история заказов.

## API

Все маршруты API имеют префикс `/api`.

### Авторизация

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Пользователь

```text
PATCH /api/users/me
```

### Каталог

```text
GET /api/categories
GET /api/products
GET /api/products/:slug
```

`GET /api/products` поддерживает параметры `category`, `q`, `featured`, `sort`, `limit` и `page`.

### Корзина

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId
DELETE /api/cart
```

### Заказы

```text
POST /api/checkout
GET  /api/orders
GET  /api/orders/:id
```

## Архитектура

Frontend и backend находятся в одном npm workspace. Vue-приложение разделено на страницы, компоненты, сервисы и Pinia-хранилища. Express API организован по функциональным модулям и использует middleware для авторизации, валидации и обработки ошибок.

При локальном запуске данные сохраняются во встроенной PGlite. В production API автоматически подключается к Neon PostgreSQL через защищённые переменные окружения Vercel.
