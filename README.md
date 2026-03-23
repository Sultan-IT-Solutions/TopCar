# TopCar

Репозиторий фронтенда TopCar на `Next.js` с хранением данных, аутентификацией
и медиа через `Supabase`.

## Архитектура

Проект работает по схеме `Next.js + Supabase`.

На стороне Supabase используются:

- `Auth` для регистрации, входа и пользовательских сессий;
- `Postgres` для каталога автомобилей, тарифов, расчетов, бронирований и промокодов;
- `Storage` bucket `cars` для изображений автопарка.

## Запуск

Установите Yarn:

```bash
npm install -g yarn
```

Клонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/Sultan-IT-Solutions/TopCar.git
cd TopCar

yarn install
```

Создайте файл `packages/frontend/.env.local` на основе примера
`packages/frontend/.env.example`.

Минимальный набор переменных:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

Для production-админки также требуется server-only доступ Supabase:

```dotenv
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_SECRET=...
DATABASE_URL=...
```

`SUPABASE_SERVICE_ROLE_KEY` используется только на сервере для защищенных
admin API routes. Он не должен попадать в `NEXT_PUBLIC_*`.

`DATABASE_URL` является опциональной серверной переменной и используется для
применения SQL-схемы, серверных проверок соединения и прямого доступа к
Postgres из Next.js route handlers.

Для production-среды на Vercel или другой serverless-платформе рекомендуется
использовать строку подключения Supabase из `Connect -> Transaction pooler`.

## Development

Запуск приложения в режиме разработки:

```bash
yarn dev
```

Сборка проекта:

```bash
yarn build
```

Запуск production-сборки:

```bash
yarn start
```

Очистка зависимостей и сборочных артефактов:

```bash
yarn clean
```

## Схема базы данных

Готовая инициализационная миграция лежит в файле:

`packages/frontend/supabase/migrations/20260323_000001_initial_schema.sql`

Она создает все таблицы и служебные объекты, которые реально используются
текущим кодом проекта:

- `admin_users`
- `users`
- `cars`
- `prices`
- `saved_calculations`
- `bookings`
- `promocodes`
- `user_promo_codes`
- `public_promocodes`
- storage bucket `cars`

Дополнительно миграция создает:

- триггер синхронизации профилей из `auth.users` в `public.users`;
- генерацию `slug` и нормализацию цен для таблицы `cars`;
- индексы для каталога, расчетов, бронирований и промокодов;
- RLS-политики для публичного каталога, личного кабинета и админских операций.

## Применение схемы

Чтобы создать таблицы в Supabase, укажите рабочий `DATABASE_URL` и выполните:

```bash
yarn db:apply
```

Корневой скрипт проксирует команду в frontend-workspace. Сам скрипт
`packages/frontend/scripts/apply-supabase-schema.mjs` автоматически читает
`packages/frontend/.env.local` и применяет SQL-схему к вашей базе.

Если вы предпочитаете SQL Editor в Supabase, можно вставить содержимое файла
миграции вручную и выполнить его напрямую.

## Что использует базу данных на сайте

База данных нужна не для одной страницы, а для всего рабочего контура сайта:

- каталог и детальные страницы автомобилей используют таблицы `cars` и `prices`;
- калькулятор аренды использует `cars`, `prices` и сохранение результатов в
  `saved_calculations`;
- личный кабинет использует `users`, `saved_calculations`,
  `user_promo_codes` и `promocodes`;
- проверка публичных промокодов использует `public_promocodes`;
- админка использует `cars`, `bookings`, `prices` и storage bucket `cars`.

## Дополнительные переменные окружения

Опциональные интеграции:

- `BITRIX_WEBHOOK_URL`
- `AMO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TOPCAR_NOTIFICATIONS_EMAIL`

## Production Security

Для production-окружения должны быть заданы:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Для защищенного webhook-сценария дополнительно задайте:

- `AMO_WEBHOOK_SECRET`

Тогда endpoint `/api/amo-webhook` будет принимать запросы только при передаче
секрета через `?secret=...` или заголовок `x-webhook-secret`.
