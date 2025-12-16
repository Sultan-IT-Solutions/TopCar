// __tests__/validation.test.ts
import { 
  emailSchema, 
  phoneSchema, 
  nameSchema,
  bookingSchema,
  validateData,
  formatZodErrors
} from '@/lib/validation';
import { z } from 'zod';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('должен валидировать корректные email', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name+tag@example.co.uk')).not.toThrow();
    });

    it('должен отклонять некорректные email', () => {
      expect(() => emailSchema.parse('bad')).toThrow();
      expect(() => emailSchema.parse('bad@')).toThrow();
      expect(() => emailSchema.parse('@bad.com')).toThrow();
    });
  });

  describe('phoneSchema', () => {
    it('должен валидировать корректные телефоны', () => {
      expect(() => phoneSchema.parse('+77771234567')).not.toThrow();
      expect(() => phoneSchema.parse('8 (777) 123-45-67')).not.toThrow();
    });

    it('должен отклонять некорректные телефоны', () => {
      expect(() => phoneSchema.parse('123')).toThrow();
      expect(() => phoneSchema.parse('abc')).toThrow();
    });
  });

  describe('nameSchema', () => {
    it('должен валидировать корректные имена', () => {
      expect(() => nameSchema.parse('Иван')).not.toThrow();
      expect(() => nameSchema.parse('John Smith')).not.toThrow();
      expect(() => nameSchema.parse('Иван-Петров')).not.toThrow();
    });

    it('должен отклонять некорректные имена', () => {
      expect(() => nameSchema.parse('I')).toThrow(); // Слишком короткое
      expect(() => nameSchema.parse('123')).toThrow(); // Цифры
      expect(() => nameSchema.parse('Name@123')).toThrow(); // Спецсимволы
    });
  });

  describe('bookingSchema', () => {
    const validBooking = {
      name: 'Иван Иванов',
      phone: '+77771234567',
      email: 'test@example.com',
      carId: 'car-123',
      startDate: '2025-12-10',
      endDate: '2025-12-15',
    };

    it('должен валидировать корректное бронирование', () => {
      expect(() => bookingSchema.parse(validBooking)).not.toThrow();
    });

    it('должен отклонять если endDate раньше startDate', () => {
      const invalid = { ...validBooking, endDate: '2025-12-01' };
      expect(() => bookingSchema.parse(invalid)).toThrow();
    });
  });

  describe('validateData', () => {
    it('должен возвращать success: true для валидных данных', () => {
      const result = validateData(emailSchema, 'test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('должен возвращать success: false для невалидных данных', () => {
      const result = validateData(emailSchema, 'bad-email');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('formatZodErrors', () => {
    it('должен форматировать ошибки Zod', () => {
      try {
        bookingSchema.parse({ name: 'A' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatZodErrors(error);
          expect(typeof formatted).toBe('object');
        }
      }
    });
  });
});
