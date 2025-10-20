import { ReactNode } from 'react';
import { LocaleProvider } from '@/context/LocaleContext';

interface KkLayoutProps {
  children: ReactNode;
}

export default function KkLayout({ children }: KkLayoutProps) {
  return (
    <LocaleProvider locale="kk">
      {children}
    </LocaleProvider>
  );
}
