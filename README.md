# TopCar - Премиальная аренда автомобилей

Next.js приложение для аренды автомобилей с расширенными функциями безопасности и производительности.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в development режиме
npm run dev

# Сборка для production
npm run build

# Запуск production сервера
npm start

# Запуск тестов
npm test

# Линтинг
npm run lint
```

## 🔒 Реализованные улучшения безопасности

### ✅ Задача #3: Phone Formatting Bug
**Файл:** `src/lib/formatters.ts`

Реализована корректная обработка номеров телефонов:
- Функция `formatPhoneToE164()` - конвертация в международный формат E.164
- Поддержка различных входных форматов (8-777-xxx, +7-777-xxx, и т.д.)
- Валидация номеров через `isValidPhone()`
- Unit тесты в `__tests__/formatters.test.ts`

**Пример использования:**
```typescript
import { formatPhoneToE164 } from '@/lib/formatters';

const formatted = formatPhoneToE164('8 (777) 123-45-67');
// Результат: '+77771234567'
```

---

### ✅ Задача #6: Validate Inputs with Zod
**Файл:** `src/lib/validation.ts`

Комплексная валидация данных на сервере и клиенте:
- Схемы для email, телефона, имени, промокода
- Схемы для бронирования, регистрации, логина
- Helper функции `validateData()` и `formatZodErrors()`
- Type-safe валидация с автоматическим выводом типов

**Пример использования:**
```typescript
import { bookingSchema, validateData } from '@/lib/validation';

const result = validateData(bookingSchema, formData);
if (!result.success) {
  console.error(result.errors);
}
```

---

### ✅ Задача #8: Fix Race Conditions in AuthContext
**Файл:** `src/context/AuthContext.tsx`

Защита от состояния гонки при аутентификации:
- Использование `useRef` для отслеживания монтирования компонента
- Предотвращение параллельных загрузок сессии
- Безопасная очистка при размонтировании
- Обработка ошибок с try-catch блоками

---

### ✅ Задача #9: Rate Limiting
**Файл:** `src/lib/rate-limit.ts`

In-memory rate limiting для защиты от bruteforce и DDoS:
- Предустановленные конфигурации (AUTH_STRICT, API_MODERATE, WEBHOOK, и т.д.)
- Middleware `withRateLimit()` для оборачивания API routes
- Автоматическая очистка истекших записей
- Rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)

**Пример использования:**
```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit';

export const POST = withRateLimit(
  async (request) => {
    // Ваш код
  },
  RateLimitPresets.API_MODERATE
);
```

---

### ✅ Задача #10: Security Logging
**Файл:** `src/lib/security-logger.ts`

Централизованное логирование событий безопасности:
- Логирование auth событий, валидации, rate limit, CSRF, XSS
- Severity levels (INFO, WARNING, ERROR, CRITICAL)
- In-memory хранение с ограничением
- Цветной вывод в консоль для development
- Готовность к интеграции с внешними сервисами (Sentry, Datadog)

**Пример использования:**
```typescript
import { securityLogger } from '@/lib/security-logger';

securityLogger.logAuthSuccess(userId);
securityLogger.logRateLimitExceeded('/api/login', userIp);
```

---

### ✅ Задача #11: CSRF Protection
**Файл:** `src/lib/csrf.ts`

Защита от Cross-Site Request Forgery:
- Генерация криптографически безопасных токенов
- Проверка токенов для POST/PUT/DELETE запросов
- Timing-safe сравнение для защиты от timing attacks
- Cookie-based хранение с httpOnly флагом
- Client helpers для автоматического добавления токенов

**Пример использования:**
```typescript
import { csrfProtection } from '@/lib/csrf';

// В middleware
const csrfResult = csrfProtection(request);
if (csrfResult) return csrfResult; // Блокируем невалидные запросы

// На клиенте
import { useCsrfToken } from '@/lib/csrf';

const { fetch } = useCsrfToken();
await fetch('/api/endpoint', { method: 'POST', body: data });
```

---

### ✅ Задача #12: Sanitize HTML
**Файл:** `src/lib/sanitization.ts`

Защита от XSS атак через DOMPurify:
- Санитизация HTML с настраиваемыми конфигурациями
- `sanitizeText()` - удаление всего HTML
- `sanitizeRichText()` - для блогов/описаний
- `sanitizeUrl()`, `sanitizeFilename()` - специализированные функции
- `sanitizeObject()` - рекурсивная очистка объектов

**Пример использования:**
```typescript
import { sanitizeHtml, sanitizeText } from '@/lib/sanitization';

const safe = sanitizeHtml(userInput);
const plainText = sanitizeText(userInput);
```

---

### ✅ Задача #13: Security Headers
**Файл:** `src/middleware.ts`

Комплексные security headers для защиты приложения:
- **Content-Security-Policy (CSP)** - защита от XSS
- **Strict-Transport-Security (HSTS)** - только HTTPS
- **X-Frame-Options** - защита от clickjacking
- **X-Content-Type-Options** - предотвращение MIME-sniffing
- **X-XSS-Protection** - дополнительная защита от XSS
- **Referrer-Policy** - контроль referrer информации
- **Permissions-Policy** - контроль доступа к API

**Проверка:**
```bash
curl -I http://localhost:3000
```

---

### ✅ Задача #14: Error Boundaries
**Файл:** `src/components/ErrorBoundary.tsx`

React Error Boundary для graceful error handling:
- Перехват runtime ошибок в React компонентах
- Логирование ошибок в security logger
- Пользовательский fallback UI
- HOC `withErrorBoundary()` для удобного использования
- Интеграция с внешними сервисами мониторинга

**Пример использования:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### ✅ Задача #15: Accessibility Improvements
**Файл:** `src/lib/accessibility.ts`

WCAG 2.1 AA compliance utilities:
- Проверка контраста цветов
- ARIA props builders для компонентов
- Focus management для модальных окон
- Keyboard navigation helpers
- Screen reader announcements
- Skip to main content link

**Пример использования:**
```typescript
import { ariaProps, trapFocus, announceToScreenReader } from '@/lib/accessibility';

// ARIA props
<button {...ariaProps.button('Close modal')}>×</button>

// Trap focus в модале
useEffect(() => {
  const cleanup = trapFocus(modalRef.current);
  return cleanup;
}, []);

// Анонс для screen readers
announceToScreenReader('Form submitted successfully', 'polite');
```

---

### ✅ Задача #16: Performance Optimizations
**Файлы:** `src/lib/performance.ts`, `next.config.ts`

Комплексная оптимизация производительности:
- Image optimization (AVIF, WebP форматы)
- Lazy loading с Intersection Observer
- Debounce и throttle функции
- Кеширование с TTL
- Code splitting и chunk optimization
- Cache headers для статических ресурсов
- Service Worker ready

**Настройки в next.config.ts:**
- Оптимизация изображений (AVIF/WebP)
- Compression включен
- Smart code splitting
- Cache headers для статики (31536000s)

---

### ✅ Задача #17: Add Tests
**Директория:** `__tests__/`

Unit тесты для критичных модулей:
- `formatters.test.ts` - тесты форматирования телефонов
- `validation.test.ts` - тесты Zod схем
- `rate-limit.test.ts` - тесты rate limiting

**Запуск тестов:**
```bash
npm test                 # Разовый запуск
npm run test:watch       # Watch режим
npm run test:coverage    # С покрытием кода
```

**Конфигурация:** `jest.config.js`

---

### ✅ Задача #18: Refactor Duplicated Code
Унификация кода:
- Единая реализация rate-limit в `src/lib/rate-limit.ts`
- Переиспользуемые утилиты валидации
- DRY принцип в security helpers
- Shared types и интерфейсы

---

### ✅ Задача #5: Update Vulnerable Dependencies
Обновлены все уязвимые зависимости:
```bash
npm audit fix
```
**Результат:** 0 уязвимостей

---

## 📦 Установленные пакеты

### Production
- `zod` - Type-safe валидация схем
- `dompurify` - Санитизация HTML

### Development
- `jest` - Тестирование
- `@testing-library/react` - Тестирование React компонентов
- `@testing-library/jest-dom` - DOM matchers для Jest
- `ts-jest` - TypeScript support для Jest
- `@types/dompurify` - TypeScript типы для DOMPurify

---

## 🏗️ Структура проекта

```
src/
├── lib/
│   ├── validation.ts         # Zod схемы валидации
│   ├── sanitization.ts       # XSS защита (DOMPurify)
│   ├── csrf.ts               # CSRF protection
│   ├── rate-limit.ts         # Rate limiting
│   ├── security-logger.ts    # Security event logging
│   ├── formatters.ts         # Форматирование данных
│   ├── accessibility.ts      # A11y helpers
│   └── performance.ts        # Performance utilities
├── components/
│   └── ErrorBoundary.tsx     # Error boundary компонент
├── context/
│   └── AuthContext.tsx       # Auth context с race protection
└── middleware.ts             # Security headers middleware

__tests__/
├── formatters.test.ts
├── validation.test.ts
└── rate-limit.test.ts
```

---

## ❌ Задачи, требующие внешних сервисов (НЕ реализованы)

Следующие задачи требуют настройки внешних сервисов и не были реализованы:

1. **Задача #1: Server-side Admin Auth** - требует Supabase JWT и настройки service_role
2. **Задача #2: Secure Webhook Endpoint** - требует WEBHOOK_SECRET env переменную
3. **Задача #4: Promo Codes Atomic** - требует БД для атомарных операций
4. **Задача #7: Supabase RLS** - требует настройку Supabase и миграции
5. **Задача #19: Monitoring (Sentry)** - требует Sentry API key

---

## 🧪 Тестирование

### Запуск тестов
```bash
npm test
```

### Проверка security headers
```bash
curl -I http://localhost:3000
```

### Проверка rate limiting
```bash
# Windows PowerShell
for ($i=1; $i -le 70; $i++) { 
  Invoke-WebRequest -Uri "http://localhost:3000/api/endpoint" -Method GET
}
```

---

## 📝 Changelog

### Версия 1.0.0 (December 2025)

**Security:**
- ✅ Phone formatting в E.164
- ✅ Zod валидация всех форм
- ✅ Rate limiting (in-memory)
- ✅ Security logging
- ✅ CSRF protection
- ✅ XSS защита (DOMPurify)
- ✅ Security headers (CSP, HSTS, и т.д.)
- ✅ Error boundaries
- ✅ Race condition fix в AuthContext

**Performance:**
- ✅ Image optimization (AVIF/WebP)
- ✅ Code splitting
- ✅ Cache headers
- ✅ Lazy loading utilities
- ✅ Debounce/throttle

**Accessibility:**
- ✅ WCAG 2.1 AA utilities
- ✅ ARIA props helpers
- ✅ Focus management
- ✅ Keyboard navigation
- ✅ Screen reader support

**Testing:**
- ✅ Jest configuration
- ✅ Unit tests для критичных модулей
- ✅ Test coverage setup

**Dependencies:**
- ✅ Обновлены все уязвимые пакеты
- ✅ 0 vulnerabilities

---

## 👥 Авторы

TopCar Development Team

## 📄 Лицензия

Proprietary
