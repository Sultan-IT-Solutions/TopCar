// src/lib/accessibility.ts

/**
 * Accessibility helpers для улучшения доступности приложения
 * WCAG 2.1 AA compliance
 */

/**
 * Проверяет достаточен ли контраст между цветами
 * @param foreground - цвет переднего плана (hex)
 * @param background - цвет фона (hex)
 * @returns коэффициент контраста
 */
export function getContrastRatio(
    foreground: string,
    background: string,
): number {
    const getLuminance = (hex: string): number => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;

        const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928
                ? c / 12.92
                : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Проверяет соответствие контраста WCAG AA
 */
export function meetsWCAGAA(
    foreground: string,
    background: string,
    large = false,
): boolean {
    const ratio = getContrastRatio(foreground, background);
    return large ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Генерирует уникальный ID для aria-labelledby и aria-describedby
 */
let idCounter = 0;
export function generateA11yId(prefix = 'a11y'): string {
    return `${prefix}-${++idCounter}`;
}

/**
 * Announces сообщение для screen readers (live region)
 */
export function announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
): void {
    if (typeof document === 'undefined') return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);

    setTimeout(() => {
        document.body.removeChild(liveRegion);
    }, 1000);
}

/**
 * Создает визуально скрытый элемент (для screen readers)
 */
export const srOnlyStyles: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
};

/**
 * Trap focus внутри модального окна
 */
export function trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Устанавливаем фокус на первый элемент
    firstElement?.focus();

    // Возвращаем функцию очистки
    return () => {
        element.removeEventListener('keydown', handleKeyDown);
    };
}

/**
 * Управление фокусом при открытии/закрытии модалов
 */
export class FocusManager {
    private previouslyFocused: HTMLElement | null = null;

    save(): void {
        this.previouslyFocused = document.activeElement as HTMLElement;
    }

    restore(): void {
        if (this.previouslyFocused && this.previouslyFocused.focus) {
            this.previouslyFocused.focus();
        }
        this.previouslyFocused = null;
    }
}

/**
 * Keyboard navigation helper
 */
export const keyboardHandler = {
    onEnterOrSpace: (callback: () => void) => {
        return (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback();
            }
        };
    },

    onEscape: (callback: () => void) => {
        return (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                callback();
            }
        };
    },

    onArrowKeys: (callbacks: {
        up?: () => void;
        down?: () => void;
        left?: () => void;
        right?: () => void;
    }) => {
        return (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    callbacks.up?.();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    callbacks.down?.();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    callbacks.left?.();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    callbacks.right?.();
                    break;
            }
        };
    },
};

/**
 * Aria props builder для общих компонентов
 */
export const ariaProps = {
    button: (label: string, pressed?: boolean) => ({
        role: 'button',
        'aria-label': label,
        ...(pressed !== undefined && { 'aria-pressed': pressed }),
        tabIndex: 0,
    }),

    link: (label: string, external = false) => ({
        'aria-label': label,
        ...(external && {
            'aria-label': `${label} (opens in new window)`,
            rel: 'noopener noreferrer',
            target: '_blank',
        }),
    }),

    dialog: (labelId: string, describedById?: string) => ({
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': labelId,
        ...(describedById && { 'aria-describedby': describedById }),
    }),

    menu: () => ({
        role: 'menu',
        'aria-orientation': 'vertical' as const,
    }),

    menuItem: (label: string) => ({
        role: 'menuitem',
        'aria-label': label,
        tabIndex: -1,
    }),

    tab: (selected: boolean, controls: string) => ({
        role: 'tab',
        'aria-selected': selected,
        'aria-controls': controls,
        tabIndex: selected ? 0 : -1,
    }),

    tabPanel: (labelledBy: string, hidden: boolean) => ({
        role: 'tabpanel',
        'aria-labelledby': labelledBy,
        hidden,
        tabIndex: 0,
    }),
};

/**
 * Проверяет поддержку prefers-reduced-motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Skip to main content link props (для навигации с клавиатуры)
 */
export const skipToMainContentProps = {
    href: '#main-content',
    className:
        'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-4',
    style: srOnlyStyles,
};
