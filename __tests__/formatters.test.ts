// __tests__/formatters.test.ts
import { formatPhoneToE164, formatPhoneNumber, isValidPhone } from '@/lib/formatters';

describe('Phone Formatters', () => {
  describe('formatPhoneToE164', () => {
    it('должен конвертировать 8-xxx формат в E.164', () => {
      expect(formatPhoneToE164('8 (777) 123-45-67')).toBe('+77771234567');
      expect(formatPhoneToE164('8-777-123-45-67')).toBe('+77771234567');
      expect(formatPhoneToE164('87771234567')).toBe('+77771234567');
    });

    it('должен конвертировать +7 формат в E.164', () => {
      expect(formatPhoneToE164('+7 (777) 123-45-67')).toBe('+77771234567');
      expect(formatPhoneToE164('+7-777-123-45-67')).toBe('+77771234567');
      expect(formatPhoneToE164('+77771234567')).toBe('+77771234567');
    });

    it('должен добавить +7 если номер без префикса', () => {
      expect(formatPhoneToE164('7771234567')).toBe('+77771234567');
    });

    it('должен обрабатывать международные форматы', () => {
      expect(formatPhoneToE164('+1 650-555-1234')).toBe('+16505551234');
    });

    it('должен возвращать пустую строку для пустого ввода', () => {
      expect(formatPhoneToE164('')).toBe('');
      expect(formatPhoneToE164(null as any)).toBe('');
      expect(formatPhoneToE164(undefined as any)).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('должен форматировать номер для UI', () => {
      const result = formatPhoneNumber('77771234567');
      expect(result).toContain('+7');
      expect(result).toContain('777');
    });
  });

  describe('isValidPhone', () => {
    it('должен валидировать корректные номера', () => {
      expect(isValidPhone('77771234567')).toBe(true);
      expect(isValidPhone('87771234567')).toBe(true);
      expect(isValidPhone('+7 (777) 123-45-67')).toBe(true);
    });

    it('должен отклонять некорректные номера', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('999999999')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});
