import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — TopCar Club Алматы',
  description: 'Политика конфиденциальности TopCar Club: как мы защищаем ваши персональные данные при аренде элитных авто и электрокаров в Алматы. Privacy policy for premium car rental in Almaty.',
  alternates: { canonical: 'https://topcar.club/privacy-policy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}