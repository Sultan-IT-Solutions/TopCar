// __tests__/rate-limit.test.ts
import { rateLimiter, RateLimitPresets } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Очищаем перед каждым тестом
    rateLimiter.resetAll();
  });

  afterAll(() => {
    // Останавливаем cleanup
    rateLimiter.stopCleanup();
  });

  it('должен разрешить запросы в пределах лимита', () => {
    const config = { windowMs: 60000, maxRequests: 5, message: 'Test' };
    const key = 'test-key';

    for (let i = 0; i < 5; i++) {
      const isLimited = rateLimiter.isRateLimited(key, config);
      expect(isLimited).toBe(false);
    }
  });

  it('должен блокировать запросы при превышении лимита', () => {
    const config = { windowMs: 60000, maxRequests: 3, message: 'Test' };
    const key = 'test-key-2';

    // Первые 3 запроса - OK
    for (let i = 0; i < 3; i++) {
      rateLimiter.isRateLimited(key, config);
    }

    // 4-й запрос должен быть заблокирован
    const isLimited = rateLimiter.isRateLimited(key, config);
    expect(isLimited).toBe(true);
  });

  it('должен сбросить лимит после истечения окна', (done) => {
    const config = { windowMs: 100, maxRequests: 2, message: 'Test' };
    const key = 'test-key-3';

    // Достигаем лимита
    rateLimiter.isRateLimited(key, config);
    rateLimiter.isRateLimited(key, config);
    rateLimiter.isRateLimited(key, config);

    // Ждем истечения окна
    setTimeout(() => {
      const isLimited = rateLimiter.isRateLimited(key, config);
      expect(isLimited).toBe(false);
      done();
    }, 150);
  });

  it('должен корректно возвращать информацию о лимите', () => {
    const config = { windowMs: 60000, maxRequests: 5, message: 'Test' };
    const key = 'test-key-4';

    rateLimiter.isRateLimited(key, config);
    const info = rateLimiter.getRateLimitInfo(key, config);

    expect(info.remaining).toBe(4);
    expect(info.isLimited).toBe(false);
  });

  it('должен сбросить лимит вручную', () => {
    const config = { windowMs: 60000, maxRequests: 2, message: 'Test' };
    const key = 'test-key-5';

    rateLimiter.isRateLimited(key, config);
    rateLimiter.isRateLimited(key, config);
    rateLimiter.isRateLimited(key, config);

    // Сбрасываем
    rateLimiter.reset(key);

    const isLimited = rateLimiter.isRateLimited(key, config);
    expect(isLimited).toBe(false);
  });

  describe('Presets', () => {
    it('должен иметь предустановленные конфигурации', () => {
      expect(RateLimitPresets.AUTH_STRICT).toBeDefined();
      expect(RateLimitPresets.API_MODERATE).toBeDefined();
      expect(RateLimitPresets.WEBHOOK).toBeDefined();
      expect(RateLimitPresets.FORM_SUBMISSION).toBeDefined();
      expect(RateLimitPresets.GENERAL).toBeDefined();
    });
  });
});
