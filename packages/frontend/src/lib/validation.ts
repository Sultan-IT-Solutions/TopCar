// src/lib/validation.ts
import { z } from 'zod';

/**
 * Схемы валидации для форм с использованием Zod
 * Обеспечивают type-safe валидацию на сервере и клиенте
 */

// Схема для валидации email
export const emailSchema = z
    .string()
    .email('Некорректный email адрес')
    .min(5, 'Email слишком короткий')
    .max(100, 'Email слишком длинный');

// Схема для валидации телефона (поддерживает форматы КЗ/РФ)
export const phoneSchema = z
    .string()
    .min(10, 'Номер телефона слишком короткий')
    .max(18, 'Номер телефона слишком длинный')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Номер телефона содержит недопустимые символы')
    .refine((val) => {
        const cleaned = val.replace(/[^\d]/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    }, 'Номер телефона должен содержать 10-11 цифр');

// Схема для валидации имени
export const nameSchema = z
    .string()
    .min(2, 'Имя слишком короткое')
    .max(50, 'Имя слишком длинное')
    .regex(
        /^[а-яёА-ЯЁa-zA-Z\s\-]+$/,
        'Имя может содержать только буквы, пробелы и дефисы',
    );

// Схема для валидации промокода
export const promoCodeSchema = z
    .string()
    .min(3, 'Промокод слишком короткий')
    .max(20, 'Промокод слишком длинный')
    .regex(
        /^[A-Z0-9\-_]+$/i,
        'Промокод может содержать только латинские буквы, цифры, дефисы и подчеркивания',
    );

// Схема для валидации даты
export const dateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
    .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
    }, 'Дата должна быть в будущем');

// Схема для бронирования автомобиля
export const bookingSchema = z
    .object({
        name: nameSchema,
        phone: phoneSchema,
        email: emailSchema.optional(),
        carId: z.string().min(1, 'Выберите автомобиль'),
        startDate: dateSchema,
        endDate: dateSchema,
        promoCode: promoCodeSchema.optional(),
        comment: z.string().max(500, 'Комментарий слишком длинный').optional(),
    })
    .refine(
        (data) => {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return end > start;
        },
        {
            message: 'Дата окончания должна быть позже даты начала',
            path: ['endDate'],
        },
    );

// Схема для создания лида в AmoCRM
export const leadSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema.optional(),
    message: z.string().max(1000, 'Сообщение слишком длинное').optional(),
    source: z.string().optional(),
});

// Схема для калькулятора аренды
export const calculationSchema = z
    .object({
        carId: z.string().min(1, 'Выберите автомобиль'),
        startDate: dateSchema,
        endDate: dateSchema,
        promoCode: promoCodeSchema.optional(),
        withDriver: z.boolean().optional(),
        insurance: z.enum(['basic', 'full', 'premium']).optional(),
    })
    .refine(
        (data) => {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return end > start;
        },
        {
            message: 'Дата окончания должна быть позже даты начала',
            path: ['endDate'],
        },
    );

// Схема для логина (базовая, без проверки Supabase)
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

// Схема для регистрации
export const registerSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        phone: phoneSchema,
        password: z
            .string()
            .min(8, 'Пароль должен содержать минимум 8 символов')
            .regex(
                /[A-Z]/,
                'Пароль должен содержать хотя бы одну заглавную букву',
            )
            .regex(
                /[a-z]/,
                'Пароль должен содержать хотя бы одну строчную букву',
            )
            .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    });

// Схема для webhook от AmoCRM
export const amoWebhookSchema = z.object({
    event: z.string().optional(),
    type: z.string().optional(),
    lead_id: z.union([z.string(), z.number()]).optional(),
    lead_name: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    contact_phone: z.string().optional(),
    email: z.string().optional(),
});

/**
 * Утилита для безопасной валидации данных
 * @param schema - Zod схема
 * @param data - данные для валидации
 * @returns объект с результатом валидации
 */
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
} {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}

/**
 * Форматирует ошибки Zod для клиента
 * @param error - ZodError
 * @returns объект с читаемыми ошибками
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    error.issues.forEach((err) => {
        const path = err.path.join('.');
        formatted[path] = err.message;
    });
    return formatted;
}
