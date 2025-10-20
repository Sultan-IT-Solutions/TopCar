import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { LocaleProvider } from '@/context/LocaleContext';

const locales = ['ru', 'en', 'kk'] as const;
type Locale = typeof locales[number];

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Проверяем, что локаль валидна
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <LocaleProvider locale={locale as Locale}>
      {children}
    </LocaleProvider>
  );
}
