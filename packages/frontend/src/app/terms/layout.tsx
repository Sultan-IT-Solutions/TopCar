import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Условия аренды — TopCar Club Алматы',
  description: 'Ознакомьтесь с условиями аренды элитных автомобилей и электрокаров в Алматы. Прозрачные правила, ответственность сторон, порядок бронирования и оплаты. Premium car rental terms in Almaty.',
  alternates: { canonical: 'https://topcar.club/terms' },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}