// src/lib/security-logger.ts

/**
 * Security Logger - система логирования событий безопасности
 * Записывает критичные события для аудита и мониторинга
 */

export enum SecurityEventType {
    AUTH_SUCCESS = 'auth_success',
    AUTH_FAILURE = 'auth_failure',
    AUTH_LOGOUT = 'auth_logout',
    VALIDATION_ERROR = 'validation_error',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    CSRF_TOKEN_INVALID = 'csrf_token_invalid',
    WEBHOOK_SIGNATURE_INVALID = 'webhook_signature_invalid',
    XSS_ATTEMPT = 'xss_attempt',
    SUSPICIOUS_ACTIVITY = 'suspicious_activity',
    API_ERROR = 'api_error',
    DATABASE_ERROR = 'database_error',
}

export enum SecurityEventSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical',
}

export interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: SecurityEventType;
    severity: SecurityEventSeverity;
    message: string;
    metadata?: Record<string, any>;
    userId?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
}

class SecurityLogger {
    private logs: SecurityEvent[] = [];
    private maxLogs = 1000; // Максимум логов в памяти
    private isDevelopment = process.env.NODE_ENV === 'development';

    /**
     * Логирует событие безопасности
     */
    log(
        type: SecurityEventType,
        severity: SecurityEventSeverity,
        message: string,
        metadata?: Record<string, any>,
    ): void {
        const event: SecurityEvent = {
            id: this.generateId(),
            timestamp: new Date(),
            type,
            severity,
            message,
            metadata: this.sanitizeMetadata(metadata),
        };

        // Добавляем в память
        this.logs.push(event);

        // Ограничиваем размер массива
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Выводим в консоль
        this.consoleLog(event);

        // В production отправляем во внешний сервис (когда будет настроен)
        if (!this.isDevelopment) {
            this.sendToExternalService(event);
        }
    }

    /**
     * Логирует успешную аутентификацию
     */
    logAuthSuccess(userId: string, metadata?: Record<string, any>): void {
        this.log(
            SecurityEventType.AUTH_SUCCESS,
            SecurityEventSeverity.INFO,
            `User authenticated successfully: ${userId}`,
            { userId, ...metadata },
        );
    }

    /**
     * Логирует неудачную попытку аутентификации
     */
    logAuthFailure(reason: string, metadata?: Record<string, any>): void {
        this.log(
            SecurityEventType.AUTH_FAILURE,
            SecurityEventSeverity.WARNING,
            `Authentication failed: ${reason}`,
            metadata,
        );
    }

    /**
     * Логирует превышение rate limit
     */
    logRateLimitExceeded(endpoint: string, ip?: string): void {
        this.log(
            SecurityEventType.RATE_LIMIT_EXCEEDED,
            SecurityEventSeverity.WARNING,
            `Rate limit exceeded for endpoint: ${endpoint}`,
            { endpoint, ip },
        );
    }

    /**
     * Логирует ошибку валидации
     */
    logValidationError(
        field: string,
        error: string,
        metadata?: Record<string, any>,
    ): void {
        this.log(
            SecurityEventType.VALIDATION_ERROR,
            SecurityEventSeverity.WARNING,
            `Validation error on field "${field}": ${error}`,
            { field, error, ...metadata },
        );
    }

    /**
     * Логирует невалидный CSRF токен
     */
    logCsrfInvalid(endpoint: string, metadata?: Record<string, any>): void {
        this.log(
            SecurityEventType.CSRF_TOKEN_INVALID,
            SecurityEventSeverity.ERROR,
            `Invalid CSRF token for endpoint: ${endpoint}`,
            { endpoint, ...metadata },
        );
    }

    /**
     * Логирует невалидную подпись webhook
     */
    logWebhookSignatureInvalid(
        source: string,
        metadata?: Record<string, any>,
    ): void {
        this.log(
            SecurityEventType.WEBHOOK_SIGNATURE_INVALID,
            SecurityEventSeverity.ERROR,
            `Invalid webhook signature from: ${source}`,
            { source, ...metadata },
        );
    }

    /**
     * Логирует попытку XSS атаки
     */
    logXssAttempt(field: string, payload: string): void {
        this.log(
            SecurityEventType.XSS_ATTEMPT,
            SecurityEventSeverity.CRITICAL,
            `XSS attempt detected in field: ${field}`,
            { field, payload: payload.substring(0, 100) },
        );
    }

    /**
     * Логирует подозрительную активность
     */
    logSuspiciousActivity(
        description: string,
        metadata?: Record<string, any>,
    ): void {
        this.log(
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            SecurityEventSeverity.ERROR,
            description,
            metadata,
        );
    }

    /**
     * Получить последние логи
     */
    getRecentLogs(limit = 100): SecurityEvent[] {
        return this.logs.slice(-limit);
    }

    /**
     * Получить логи по типу
     */
    getLogsByType(type: SecurityEventType, limit = 100): SecurityEvent[] {
        return this.logs.filter((log) => log.type === type).slice(-limit);
    }

    /**
     * Получить логи по severity
     */
    getLogsBySeverity(
        severity: SecurityEventSeverity,
        limit = 100,
    ): SecurityEvent[] {
        return this.logs
            .filter((log) => log.severity === severity)
            .slice(-limit);
    }

    /**
     * Очистить старые логи
     */
    clearOldLogs(olderThanHours = 24): void {
        const cutoffTime = new Date(
            Date.now() - olderThanHours * 60 * 60 * 1000,
        );
        this.logs = this.logs.filter((log) => log.timestamp > cutoffTime);
    }

    /**
     * Вывод в консоль с цветами
     */
    private consoleLog(event: SecurityEvent): void {
        const colors = {
            info: '\x1b[36m', // Cyan
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m', // Red
            critical: '\x1b[35m', // Magenta
            reset: '\x1b[0m',
        };

        const color = colors[event.severity] || colors.reset;
        const timestamp = event.timestamp.toISOString();

        console.log(
            `${color}[SECURITY ${event.severity.toUpperCase()}]${colors.reset} ${timestamp} - ${event.type}: ${event.message}`,
            event.metadata
                ? `\n  Metadata: ${JSON.stringify(event.metadata, null, 2)}`
                : '',
        );
    }

    /**
     * Отправка во внешний сервис (Sentry, Datadog, etc.)
     */
    private async sendToExternalService(event: SecurityEvent): Promise<void> {
        // TODO: Интеграция с внешним сервисом мониторинга
        // Пример: await fetch('https://monitoring-service.com/api/logs', { ... })

        // Пока просто заглушка
        if (event.severity === SecurityEventSeverity.CRITICAL) {
            console.error('CRITICAL SECURITY EVENT:', event);
        }
    }

    /**
     * Генерация уникального ID для события
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Санитизация metadata (удаляем чувствительные данные)
     */
    private sanitizeMetadata(
        metadata?: Record<string, any>,
    ): Record<string, any> | undefined {
        if (!metadata) return undefined;

        const sensitiveKeys = [
            'password',
            'token',
            'secret',
            'apiKey',
            'authorization',
        ];
        const sanitized: Record<string, any> = {};

        for (const key in metadata) {
            if (
                sensitiveKeys.some((sensitive) =>
                    key.toLowerCase().includes(sensitive),
                )
            ) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = metadata[key];
            }
        }

        return sanitized;
    }
}

// Экспортируем singleton инстанс
export const securityLogger = new SecurityLogger();

// Экспортируем класс для тестирования
export { SecurityLogger };
