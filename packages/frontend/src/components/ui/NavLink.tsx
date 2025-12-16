'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

type NavLinkProps = {
  href: string
  children: ReactNode
  currentPath: string
}

export default function NavLink({ href, children, currentPath }: NavLinkProps) {
  const isActive = currentPath === href

  return (
    <Link
      href={href}
      className={clsx(
        'text-sm font-medium transition-colors hover:text-primary',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  )
}
