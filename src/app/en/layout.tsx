import { ReactNode } from 'react';
import { LocaleProvider } from '@/context/LocaleContext';

interface EnLayoutProps {
  children: ReactNode;
}

export default function EnLayout({ children }: EnLayoutProps) {
  return (
    <LocaleProvider locale="en">
      {children}
    </LocaleProvider>
  );
}
