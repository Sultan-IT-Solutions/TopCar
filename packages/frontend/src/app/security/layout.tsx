import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Безопасность — TopCar Club Алматы',
  description: 'Меры безопасности TopCar Club: защита данных, безопасные платежи, ответственность при аренде элитных авто и электрокаров в Алматы. Security policy for premium car rental in Almaty.',
  alternates: { canonical: 'https://topcar.club/security' },
  robots: { index: true, follow: true },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}