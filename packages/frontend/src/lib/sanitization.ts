// src/lib/sanitization.ts
import DOMPurify from 'dompurify';

/**
 * Защита от XSS атак через санитизацию HTML
 * Использует DOMPurify для безопасной очистки HTML контента
 * Работает как на сервере (с isomorphic-dompurify), так и в браузере
 */

// Инициализация DOMPurify (работает универсально)
const purify = DOMPurify;

/**
 * Базовая конфигурация DOMPurify
 * Разрешает только безопасные теги и атрибуты
 */
const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'u',
        'p',
        'br',
        'span',
        'a',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'code',
        'pre',
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
};

/**
 * Строгая конфигурация - только текст без HTML
 */
const strictConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
};

/**
 * Конфигурация для rich text (разметка + ссылки)
 */
const richTextConfig: DOMPurify.Config = {
    ...defaultConfig,
    ALLOWED_TAGS: [
        ...(defaultConfig.ALLOWED_TAGS || []),
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
    ],
    ALLOWED_ATTR: [
        ...(defaultConfig.ALLOWED_ATTR || []),
        'src',
        'alt',
        'width',
        'height',
        'style',
    ],
};

/**
 * Основная функция санитизации HTML
 * @param dirty - небезопасный HTML
 * @param config - конфигурация DOMPurify (опционально)
 * @returns безопасный HTML
 */
export function sanitizeHtml(
    dirty: string,
    config: DOMPurify.Config = defaultConfig,
): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    return purify.sanitize(dirty, config);
}

/**
 * Санитизация только текста (удаляет весь HTML)
 * @param dirty - текст с возможным HTML
 * @returns чистый текст без HTML
 */
export function sanitizeText(dirty: string): string {
    return sanitizeHtml(dirty, strictConfig);
}

/**
 * Санитизация rich text контента (для блогов, описаний)
 * @param dirty - rich text HTML
 * @returns безопасный rich text
 */
export function sanitizeRichText(dirty: string): string {
    return sanitizeHtml(dirty, richTextConfig);
}

/**
 * Санитизация URL
 * @param url - URL для проверки
 * @returns безопасный URL или пустая строка
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        return '';
    }

    // Разрешаем только безопасные протоколы
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    try {
        const parsed = new URL(url);
        if (allowedProtocols.includes(parsed.protocol)) {
            return url;
        }
    } catch {
        // Невалидный URL
        return '';
    }

    return '';
}

/**
 * Санитизация имени файла
 * @param filename - имя файла
 * @returns безопасное имя файла
 */
export function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
        return '';
    }

    // Удаляем путь и опасные символы
    return filename
        .replace(/^.*[\\\/]/, '') // Удаляем путь
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Заменяем опасные символы
        .substring(0, 255); // Ограничиваем длину
}

/**
 * Санитизация объекта (рекурсивно очищает все строковые поля)
 * @param obj - объект для санитизации
 * @param config - конфигурация DOMPurify
 * @returns объект с санитизированными значениями
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    config: DOMPurify.Config = defaultConfig,
): T {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'string') {
                result[key] = sanitizeHtml(value, config);
            } else if (
                typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)
            ) {
                result[key] = sanitizeObject(value, config);
            } else if (Array.isArray(value)) {
                result[key] = value.map((item: any) =>
                    typeof item === 'string'
                        ? sanitizeHtml(item, config)
                        : typeof item === 'object'
                          ? sanitizeObject(item, config)
                          : item,
                );
            } else {
                result[key] = value;
            }
        }
    }

    return result as T;
}

/**
 * Экранирование HTML entities (для вывода в атрибутах)
 * @param str - строка для экранирования
 * @returns экранированная строка
 */
export function escapeHtml(str: string): string {
    if (!str || typeof str !== 'string') {
        return '';
    }

    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return str.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Клиентская версия санитизации (для использования в браузере)
 */
export const clientSanitize = {
    html: (dirty: string) => {
        if (typeof window === 'undefined') {
            return sanitizeHtml(dirty);
        }
        return DOMPurify.sanitize(dirty, defaultConfig);
    },

    text: (dirty: string) => {
        if (typeof window === 'undefined') {
            return sanitizeText(dirty);
        }
        return DOMPurify.sanitize(dirty, strictConfig);
    },

    richText: (dirty: string) => {
        if (typeof window === 'undefined') {
            return sanitizeRichText(dirty);
        }
        return DOMPurify.sanitize(dirty, richTextConfig);
    },
};
