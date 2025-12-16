'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

type NavButtonProps = {
  href?: string
  onClick?: () => void
  children: ReactNode
  title?: string
}

export default function NavButton({ href, onClick, children, title }: NavButtonProps) {
  const commonClasses =
    'flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors';

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(commonClasses, 'text-muted-foreground')}
        title={title}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={clsx(commonClasses, 'text-muted-foreground')}
      title={title}
    >
      {children}
    </button>
  );
}
