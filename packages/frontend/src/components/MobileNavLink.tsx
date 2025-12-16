import Link from 'next/link';
import clsx from 'clsx';
import React, { forwardRef, ReactNode } from 'react';

type MobileNavLinkProps = {
  href: string;
  currentPath: string;
  children: ReactNode;
  onClick?: () => void;
};

const MobileNavLink = forwardRef<HTMLAnchorElement, MobileNavLinkProps>(
  ({ href, currentPath, children, onClick }, ref) => {
    const isActive = currentPath === href;
    return (
      <Link
        href={href}
        ref={ref}
        onClick={onClick}
        className={clsx(
          'flex items-center gap-3 rounded-md p-3 text-base font-semibold transition-colors',
          isActive ? 'bg-brand-accent/10 text-brand-accent' : 'text-neutral-300 hover:bg-neutral-700/50'
        )}
      >
        {children}
      </Link>
    );
  }
);
MobileNavLink.displayName = 'MobileNavLink';
export default MobileNavLink;