// src/lib/performance.ts

/**
 * Performance optimization utilities
 * Улучшение производительности Next.js приложения
 */

/**
 * Lazy load изображений с placeholder
 */
export function getImageLoader() {
    return {
        loader: ({
            src,
            width,
            quality,
        }: {
            src: string;
            width: number;
            quality?: number;
        }) => {
            const params = new URLSearchParams({
                url: src,
                w: width.toString(),
                q: (quality || 75).toString(),
            });
            return `/api/image?${params}`;
        },
    };
}

/**
 * Генерация base64 placeholder для изображений (blur effect)
 */
export async function getBase64ImagePlaceholder(
    imageUrl: string,
): Promise<string> {
    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    } catch {
        // Fallback: генерируем простой серый placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
    }
}

/**
 * Debounce функция для оптимизации событий
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle функция для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Intersection Observer hook для lazy loading
 */
export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options: IntersectionObserverInit = {},
): boolean {
    const [isIntersecting, setIsIntersecting] = React.useState(false);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
}

/**
 * Preload критичных ресурсов
 */
export function preloadResource(href: string, as: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;

    document.head.appendChild(link);
}

/**
 * Prefetch следующей страницы
 */
export function prefetchPage(href: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    document.head.appendChild(link);
}

/**
 * Web Vitals reporter
 */
export function reportWebVitals(metric: any): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(metric);
    }

    // В production отправляем в analytics
    // Пример: analytics.track('web-vital', metric)
}

/**
 * Оптимизация рендеринга больших списков
 */
export function useVirtualization<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
): {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    offsetY: number;
} {
    const [scrollTop, setScrollTop] = React.useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight),
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
        visibleItems,
        startIndex,
        endIndex,
        totalHeight,
        offsetY,
    };
}

/**
 * Кеширование с TTL
 */
class CacheWithTTL<T> {
    private cache = new Map<string, { value: T; expires: number }>();

    set(key: string, value: T, ttlMs: number): void {
        this.cache.set(key, {
            value,
            expires: Date.now() + ttlMs,
        });
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const cache = new CacheWithTTL();

/**
 * Service Worker регистрация для PWA
 */
export async function registerServiceWorker(): Promise<
    ServiceWorkerRegistration | undefined
> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return undefined;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return undefined;
    }
}

/**
 * React import helper
 */
declare const React: typeof import('react');
