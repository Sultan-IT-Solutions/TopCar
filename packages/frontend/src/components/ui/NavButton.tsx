'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import LocalizedLink from '@/components/LocalizedLink';

type NavButtonProps = {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    title?: string;
    description?: string;
    ariaLabel?: string;
};

export default function NavButton({
    href,
    onClick,
    children,
    title,
    description,
    ariaLabel,
}: NavButtonProps) {
    const commonClasses =
        'group relative flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors';

    const tooltip = title ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 hidden w-max min-w-[180px] max-w-[240px] -translate-x-1/2 rounded-xl border border-white/10 bg-neutral-900/95 px-3 py-2 text-left shadow-2xl backdrop-blur md:group-hover:block md:group-focus-within:block">
            <span className="block text-sm font-semibold text-white">
                {title}
            </span>
            {description && (
                <span className="mt-0.5 block text-xs leading-relaxed text-neutral-400">
                    {description}
                </span>
            )}
        </span>
    ) : null;

    if (href) {
        return (
            <LocalizedLink
                href={href}
                className={clsx(commonClasses, 'text-muted-foreground')}
                aria-label={ariaLabel || title}
            >
                {children}
                {tooltip}
            </LocalizedLink>
        );
    }

    return (
        <button
            onClick={onClick}
            className={clsx(commonClasses, 'text-muted-foreground')}
            aria-label={ariaLabel || title}
        >
            {children}
            {tooltip}
        </button>
    );
}
