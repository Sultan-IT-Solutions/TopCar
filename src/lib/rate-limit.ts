// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';
import { securityLogger } from './security-logger';

/**
 * Rate Limiting - защита от перебора паролей и DDoS атак
 * In-memory реализация (для production рекомендуется Redis)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number; // Окно времени в миллисекундах
  maxRequests: number; // Максимум запросов в окне
  message?: string; // Сообщение при превышении
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Запускаем периодическую очистку старых записей
    this.startCleanup();
  }

  /**
   * Проверяет rate limit для ключа
   * @returns true если лимит превышен
   */
  isRateLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    // Если записи нет или окно истекло
    if (!entry || now > entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return false;
    }

    // Увеличиваем счетчик
    entry.count++;

    // Проверяем лимит
    if (entry.count > config.maxRequests) {
      return true;
    }

    return false;
  }

  /**
   * Получает информацию о rate limit для ключа
   */
  getRateLimitInfo(key: string, config: RateLimitConfig): {
    remaining: number;
    resetAt: number;
    isLimited: boolean;
  } {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetAt) {
      return {
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt,
      isLimited: entry.count >= config.maxRequests,
    };
  }

  /**
   * Сбрасывает rate limit для ключа
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Очищает все rate limits
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * Периодическая очистка истекших записей
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetAt) {
          this.store.delete(key);
        }
      }
    }, 60000); // Каждую минуту
  }

  /**
   * Останавливает очистку (для тестов)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton инстанс
const rateLimiter = new RateLimiter();

/**
 * Предустановленные конфигурации rate limit
 */
export const RateLimitPresets = {
  // Строгий лимит для логина (5 попыток в 15 минут)
  AUTH_STRICT: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
  },

  // Средний лимит для API (100 запросов в минуту)
  API_MODERATE: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'Слишком много запросов. Попробуйте позже.',
  },

  // Лимит для webhook (50 запросов в минуту)
  WEBHOOK: {
    windowMs: 60 * 1000,
    maxRequests: 50,
    message: 'Webhook rate limit exceeded.',
  },

  // Лимит для форм (10 отправок в 5 минут)
  FORM_SUBMISSION: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
    message: 'Слишком много отправок формы. Попробуйте позже.',
  },

  // Щадящий лимит для общих запросов (500 в час)
  GENERAL: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 500,
    message: 'Превышен лимит запросов. Попробуйте через час.',
  },
};

/**
 * Получает идентификатор клиента из запроса
 */
export function getClientIdentifier(request: NextRequest): string {
  // Пытаемся получить IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Можно добавить user-agent для более точной идентификации
  const userAgent = request.headers.get('user-agent') || '';
  
  return `${ip}:${userAgent}`;
}

/**
 * Middleware для rate limiting
 */
export function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix?: string
): {
  isLimited: boolean;
  remaining: number;
  resetAt: number;
} {
  const identifier = getClientIdentifier(request);
  const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
  
  const isLimited = rateLimiter.isRateLimited(key, config);
  const info = rateLimiter.getRateLimitInfo(key, config);

  if (isLimited) {
    securityLogger.logRateLimitExceeded(
      request.nextUrl.pathname,
      request.headers.get('x-forwarded-for') || undefined
    );
  }

  return {
    isLimited,
    remaining: info.remaining,
    resetAt: info.resetAt,
  };
}

/**
 * Helper для добавления rate limit headers в ответ
 */
export function addRateLimitHeaders(
  headers: Headers,
  info: { remaining: number; resetAt: number }
): void {
  headers.set('X-RateLimit-Remaining', info.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(info.resetAt / 1000).toString());
}

/**
 * Декоратор для API route с rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config: RateLimitConfig,
  keyPrefix?: string
) {
  return async (request: NextRequest): Promise<Response> => {
    const { isLimited, remaining, resetAt } = rateLimitMiddleware(
      request,
      config,
      keyPrefix
    );

    if (isLimited) {
      const response = new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
          },
        }
      );

      addRateLimitHeaders(response.headers, { remaining: 0, resetAt });
      return response;
    }

    // Выполняем handler
    const response = await handler(request);

    // Добавляем rate limit headers
    addRateLimitHeaders(response.headers, { remaining, resetAt });

    return response;
  };
}

/**
 * Специфичный rate limiter для IP адреса
 */
export function rateLimitByIp(
  request: NextRequest,
  config: RateLimitConfig
): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             'unknown';
  
  return rateLimiter.isRateLimited(`ip:${ip}`, config);
}

/**
 * Специфичный rate limiter для пользователя (по userId)
 */
export function rateLimitByUser(
  userId: string,
  config: RateLimitConfig
): boolean {
  return rateLimiter.isRateLimited(`user:${userId}`, config);
}

/**
 * Экспорт основного limiter для прямого использования
 */
export { rateLimiter };

/**
 * Пример использования в API route:
 * 
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // ваш код
 *     return NextResponse.json({ success: true });
 *   },
 *   RateLimitPresets.API_MODERATE,
 *   'api-endpoint-name'
 * );
 */
