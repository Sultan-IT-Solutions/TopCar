'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { getLocaleFromPath, localizeHref } from '@/lib/locale-routing';

type NavLinkProps = {
    href: string;
    children: ReactNode;
    currentPath: string;
};

export default function NavLink({ href, children, currentPath }: NavLinkProps) {
    const locale = getLocaleFromPath(currentPath);
    const localizedHref = localizeHref(href, locale);
    const isActive =
        localizedHref === '/'
            ? currentPath === localizedHref
            : currentPath === localizedHref ||
              currentPath.startsWith(`${localizedHref}/`);

    return (
        <Link
            href={localizedHref}
            className={clsx(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive ? 'text-primary' : 'text-muted-foreground',
            )}
        >
            {children}
        </Link>
    );
}
