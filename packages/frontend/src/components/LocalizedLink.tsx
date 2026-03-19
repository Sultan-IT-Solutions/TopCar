'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import { getLocaleFromPath, localizeHref } from '@/lib/locale-routing';

type LocalizedLinkProps = LinkProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
        children: ReactNode;
    };

export default function LocalizedLink({
    href,
    children,
    ...props
}: LocalizedLinkProps) {
    const pathname = usePathname();

    if (typeof href !== 'string') {
        return (
            <Link href={href} {...props}>
                {children}
            </Link>
        );
    }

    const locale = getLocaleFromPath(pathname);

    return (
        <Link href={localizeHref(href, locale)} {...props}>
            {children}
        </Link>
    );
}
